import { useEffect, useRef, useState } from "react";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import pdfWorkerUrl from "pdfjs-dist/legacy/build/pdf.worker.mjs?url";

import type { Locale } from "./types";

type Props = {
  cardId: number;
  imagePage: number;
  locale: Locale;
  label: string;
  pdfUrl: string;
  compact?: boolean;
};

const documentCache = new Map<string, Promise<pdfjs.PDFDocumentProxy>>();
const imageCache = new Map<string, string>();
const cropVersion = "v5";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function dominantRun(values: number[], threshold: number, start: number, end: number, maxGap: number) {
  let best = { start: -1, end: -1, score: -1 };
  let runStart = -1;
  let lastInk = -1;
  let inkTotal = 0;

  for (let index = start; index < end; index += 1) {
    const hasInk = values[index] >= threshold;
    if (hasInk) {
      if (runStart < 0) {
        runStart = index;
        inkTotal = 0;
      }
      lastInk = index;
      inkTotal += values[index];
      continue;
    }

    if (runStart >= 0 && index - lastInk > maxGap) {
      const width = lastInk - runStart + 1;
      const score = width * Math.log1p(inkTotal);
      if (score > best.score) {
        best = { start: runStart, end: lastInk, score };
      }
      runStart = -1;
      lastInk = -1;
      inkTotal = 0;
    }
  }

  if (runStart >= 0) {
    const width = lastInk - runStart + 1;
    const score = width * Math.log1p(inkTotal);
    if (score > best.score) {
      best = { start: runStart, end: lastInk, score };
    }
  }

  return best.start >= 0 ? best : null;
}

function cropToRect(canvas: HTMLCanvasElement, sx: number, sy: number, sw: number, sh: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  const cropped = document.createElement("canvas");
  cropped.width = sw;
  cropped.height = sh;
  cropped.getContext("2d")?.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
  canvas.width = sw;
  canvas.height = sh;
  ctx.drawImage(cropped, 0, 0);
}

function cropCanvasToContent(canvas: HTMLCanvasElement, cardId: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  const { width, height } = canvas;
  const image = ctx.getImageData(0, 0, width, height);
  const colInk = new Array<number>(width).fill(0);
  const leftGuard = Math.floor(width * 0.14);
  const rightGuard = Math.floor(width * 0.985);

  for (let y = 0; y < height; y += 1) {
    for (let x = leftGuard; x < rightGuard; x += 1) {
      const offset = (y * width + x) * 4;
      const r = image.data[offset];
      const g = image.data[offset + 1];
      const b = image.data[offset + 2];
      const a = image.data[offset + 3];
      const isInk = a > 20 && (r < 248 || g < 248 || b < 248);
      if (isInk) {
        colInk[x] += 1;
      }
    }
  }

  const minColInk = Math.max(4, Math.floor(height * 0.035));
  const xRun = dominantRun(colInk, minColInk, leftGuard, rightGuard, Math.max(3, Math.floor(width * 0.02)));
  if (!xRun) {
    return;
  }

  let minX = xRun.start;
  let maxX = xRun.end;
  const lowRowInk = new Array<number>(height).fill(0);
  for (let y = 0; y < height; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const offset = (y * width + x) * 4;
      const r = image.data[offset];
      const g = image.data[offset + 1];
      const b = image.data[offset + 2];
      const a = image.data[offset + 3];
      const isInk = a > 20 && (r < 250 || g < 250 || b < 250);
      if (isInk) {
        lowRowInk[y] += 1;
      }
    }
  }

  const minRowInk = Math.max(2, Math.floor((maxX - minX + 1) * 0.015));
  const yRun = dominantRun(lowRowInk, minRowInk, 0, height, Math.max(8, Math.floor(height * 0.04)));
  if (!yRun) {
    return;
  }
  let minY = yRun.start;
  let maxY = yRun.end;

  const pad = Math.max(3, Math.floor(width * 0.01));
  minX = clamp(minX - pad, leftGuard, width - 1);
  maxX = clamp(maxX + pad, minX + 1, width);
  minY = clamp(minY - pad, 0, height - 1);
  maxY = clamp(maxY + pad, minY + 1, height);

  const targetRatio = 63 / 88;
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  let sw = maxX - minX;
  let sh = maxY - minY;
  const detectedRatio = sw / sh;

  if (detectedRatio > targetRatio) {
    sh = sw / targetRatio;
  } else {
    sw = sh * targetRatio;
  }

  const sx = clamp(Math.round(centerX - sw / 2), leftGuard, Math.max(leftGuard, width - Math.round(sw)));
  const sy = clamp(Math.round(centerY - sh / 2), 0, Math.max(0, height - Math.round(sh)));
  sw = Math.min(Math.round(sw), width - sx);
  sh = Math.min(Math.round(sh), height - sy);
  cropToRect(canvas, sx, sy, sw, sh);
}

function getPdf(pdfUrl: string) {
  const key = pdfUrl;
  if (!documentCache.has(key)) {
    documentCache.set(
      key,
      pdfjs.getDocument({
        url: pdfUrl
      } as any).promise
    );
  }
  return documentCache.get(key)!;
}

export default function CardArt({ cardId, imagePage, locale, label, pdfUrl, compact = false }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);
  const [visible, setVisible] = useState(!compact);
  const [failed, setFailed] = useState(false);
  const key = `${cropVersion}:${locale}:${pdfUrl}:${cardId}:${imagePage}:${compact ? "c" : "n"}`;

  useEffect(() => {
    setFailed(false);
    const canvas = ref.current;
    if (canvas) {
      canvas.width = 1;
      canvas.height = 1;
    }
  }, [key]);

  useEffect(() => {
    const element = ref.current;
    if (!element || !compact) {
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "180px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !ref.current || failed) {
      return;
    }
    let cancelled = false;
    async function render() {
      try {
        const canvas = ref.current;
        if (!canvas) {
          return;
        }
        const cached = imageCache.get(key);
        if (cached) {
          const img = new Image();
          img.onload = () => {
            if (!cancelled && ref.current) {
              canvas.width = img.width;
              canvas.height = img.height;
              canvas.getContext("2d")?.drawImage(img, 0, 0);
            }
          };
          img.src = cached;
          return;
        }
        const doc = await getPdf(pdfUrl);
        const page = await doc.getPage(imagePage);
        const baseViewport = page.getViewport({ scale: 1 });
        const targetWidth = compact ? 180 : 420;
        const viewport = page.getViewport({ scale: targetWidth / baseViewport.width });
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        renderTaskRef.current?.cancel();
        const renderTask = page.render({ canvas, canvasContext: canvas.getContext("2d")!, viewport } as any);
        renderTaskRef.current = renderTask;
        await renderTask.promise;
        if (cancelled || ref.current !== canvas) {
          return;
        }
        renderTaskRef.current = null;
        cropCanvasToContent(canvas, cardId);
        imageCache.set(key, canvas.toDataURL("image/jpeg", 0.72));
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (!message.toLowerCase().includes("cancel")) {
          setFailed(true);
        }
      }
    }
    render();
    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
      renderTaskRef.current = null;
    };
  }, [compact, failed, imagePage, key, pdfUrl, visible]);

  return (
    <div className={compact ? "cardArt compactArt" : "cardArt"} aria-label={label}>
      <canvas ref={ref} />
      {failed ? <span>{cardId}</span> : null}
    </div>
  );
}
