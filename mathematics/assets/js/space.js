// ===== 単位円と三角関数 =====
(function() {
  const container = document.getElementById('trig-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const angleSlider = document.getElementById('trig-angle');
  const angleVal = document.getElementById('trig-angle-val');
  const animBtn = document.getElementById('trig-animate-btn');
  let animating = false, animAngle = 45, animId;

  function draw(angleDeg) {
    const W = canvas.width  = container.offsetWidth;
    const H = canvas.height = container.offsetHeight;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio||1;
    canvas.width=W*dpr; canvas.height=H*dpr; ctx.scale(dpr,dpr);
    ctx.clearRect(0,0,W,H);

    const θ = angleDeg * Math.PI / 180;
    const unitR = Math.min(W*0.3, H*0.35);
    const cx = W * 0.38, cy = H/2;

    // グリッド
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
    [-2,-1,0,1,2].forEach(i => {
      ctx.beginPath(); ctx.moveTo(cx+i*unitR, cy-H*0.4); ctx.lineTo(cx+i*unitR, cy+H*0.4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx-unitR*1.5, cy+i*unitR); ctx.lineTo(cx+unitR*1.5, cy+i*unitR); ctx.stroke();
    });

    // 軸
    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(cx-unitR*1.5,cy); ctx.lineTo(cx+unitR*1.5,cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx,cy-H*0.4); ctx.lineTo(cx,cy+H*0.4); ctx.stroke();

    // 単位円
    ctx.beginPath(); ctx.arc(cx, cy, unitR, 0, Math.PI*2);
    ctx.strokeStyle='rgba(74,184,216,0.4)'; ctx.lineWidth=1.5; ctx.stroke();

    const px = cx + unitR * Math.cos(θ);
    const py = cy - unitR * Math.sin(θ);

    // sin の垂線
    ctx.strokeStyle='rgba(109,204,152,0.7)'; ctx.lineWidth=2; ctx.setLineDash([4,3]);
    ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px, py); ctx.stroke();
    // cos の水平線
    ctx.strokeStyle='rgba(245,200,66,0.7)';
    ctx.beginPath(); ctx.moveTo(cx, py); ctx.lineTo(px, py); ctx.stroke();
    ctx.setLineDash([]);

    // 半径
    const grad = ctx.createLinearGradient(cx, cy, px, py);
    grad.addColorStop(0, 'rgba(74,184,216,0.5)');
    grad.addColorStop(1, '#4ab8d8');
    ctx.strokeStyle=grad; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(px,py); ctx.stroke();

    // 点
    ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI*2);
    ctx.fillStyle='#7dd3fc'; ctx.fill();
    ctx.strokeStyle='white'; ctx.lineWidth=1.5; ctx.stroke();

    // グラフ右側
    const graphX = W * 0.68;
    const graphW = W * 0.28;
    const graphH = unitR * 0.8;

    const drawWave = (fn, color, offsetY) => {
      ctx.beginPath();
      for (let i = 0; i <= 100; i++) {
        const t = i / 100 * Math.PI * 2;
        const x = graphX + (i/100) * graphW;
        const y = cy + offsetY - fn(t) * graphH;
        if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.strokeStyle=color; ctx.lineWidth=1.5; ctx.stroke();
      // 現在値の点
      const curX = graphX + (angleDeg/360) * graphW;
      const curY = cy + offsetY - fn(θ) * graphH;
      ctx.beginPath(); ctx.arc(curX, curY, 4, 0, Math.PI*2);
      ctx.fillStyle=color; ctx.fill();
    };
    drawWave(Math.sin, '#6dcc98', -graphH*0.1);
    drawWave(Math.cos, '#f5c842', graphH*0.1);

    // 凡例
    ctx.fillStyle='#6dcc98'; ctx.font='11px monospace'; ctx.textAlign='left';
    ctx.fillText(`sin(${angleDeg}°) = ${Math.sin(θ).toFixed(3)}`, graphX, H-26);
    ctx.fillStyle='#f5c842';
    ctx.fillText(`cos(${angleDeg}°) = ${Math.cos(θ).toFixed(3)}`, graphX, H-12);
  }

  angleSlider.addEventListener('input', () => {
    angleVal.textContent = angleSlider.value + '°';
    if (!animating) draw(parseFloat(angleSlider.value));
  });

  animBtn.addEventListener('click', () => {
    animating = !animating;
    animBtn.textContent = animating ? '⏸ 停止' : '▶ アニメーション';
    if (animating) {
      function loop() {
        animAngle = (animAngle + 0.5) % 360;
        angleSlider.value = animAngle;
        angleVal.textContent = Math.round(animAngle) + '°';
        draw(animAngle);
        animId = requestAnimationFrame(loop);
      }
      loop();
    } else {
      cancelAnimationFrame(animId);
    }
  });
  draw(45);
  window.addEventListener('resize', () => draw(parseFloat(angleSlider.value)));
})();

// ===== マンデルブロ集合 =====
(function() {
  const container = document.getElementById('mandelbrot-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const iterSlider = document.getElementById('mandel-iter');
  const iterVal = document.getElementById('mandel-iter-val');
  const renderBtn = document.getElementById('mandel-render-btn');

  function render() {
    const W = container.offsetWidth;
    const H = container.offsetHeight;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const maxIter = parseInt(iterSlider.value);
    const imageData = ctx.createImageData(W, H);

    const xMin = -2.5, xMax = 1.0, yMin = -1.25, yMax = 1.25;

    for (let px = 0; px < W; px++) {
      for (let py = 0; py < H; py++) {
        const cx = xMin + px / W * (xMax - xMin);
        const cy = yMin + py / H * (yMax - yMin);
        let zx = 0, zy = 0, i = 0;
        while (zx*zx + zy*zy < 4 && i < maxIter) {
          const tmp = zx*zx - zy*zy + cx;
          zy = 2*zx*zy + cy;
          zx = tmp;
          i++;
        }
        const idx = (py * W + px) * 4;
        if (i === maxIter) {
          imageData.data[idx] = 10;
          imageData.data[idx+1] = 10;
          imageData.data[idx+2] = 20;
        } else {
          const t = i / maxIter;
          const smooth = i + 1 - Math.log(Math.log(Math.sqrt(zx*zx+zy*zy))) / Math.log(2);
          const st = smooth / maxIter;
          imageData.data[idx]   = Math.floor(9 * (1-st)**3 * st * 255 + 15 * (1-st)**2 * st**2 * 255 + 8.5 * (1-st) * st**3 * 255);
          imageData.data[idx+1] = Math.floor(st * 200 * Math.sin(st * Math.PI * 6));
          imageData.data[idx+2] = Math.floor(255 * st);
        }
        imageData.data[idx+3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  iterSlider.addEventListener('input', () => { iterVal.textContent = iterSlider.value; });
  renderBtn.addEventListener('click', render);
  setTimeout(render, 100);
  window.addEventListener('resize', () => setTimeout(render, 200));
})();

// ===== コッホ雪片 =====
(function() {
  const container = document.getElementById('koch-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const iterSlider = document.getElementById('koch-iter');
  const iterVal = document.getElementById('koch-iter-val');

  function kochSegment(ctx, x1, y1, x2, y2, depth) {
    if (depth === 0) {
      ctx.lineTo(x2, y2);
      return;
    }
    const dx = (x2-x1)/3, dy = (y2-y1)/3;
    const ax = x1+dx, ay = y1+dy;
    const bx = x2-dx, by = y2-dy;
    const mx = (ax+bx)/2 - (by-ay)*Math.sqrt(3)/2;
    const my = (ay+by)/2 + (bx-ax)*Math.sqrt(3)/2;
    kochSegment(ctx, x1, y1, ax, ay, depth-1);
    kochSegment(ctx, ax, ay, mx, my, depth-1);
    kochSegment(ctx, mx, my, bx, by, depth-1);
    kochSegment(ctx, bx, by, x2, y2, depth-1);
  }

  function draw() {
    const W = canvas.width  = container.offsetWidth;
    const H = canvas.height = container.offsetHeight;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,W,H);

    const depth = parseInt(iterSlider.value);
    const r = Math.min(W,H) * 0.35;
    const cx = W/2, cy = H/2 + r*0.2;

    const pts = [
      {x: cx, y: cy - r},
      {x: cx + r*Math.sin(2*Math.PI/3), y: cy - r*Math.cos(2*Math.PI/3)},
      {x: cx + r*Math.sin(4*Math.PI/3), y: cy - r*Math.cos(4*Math.PI/3)},
    ];

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 0; i < 3; i++) {
      const next = pts[(i+1)%3];
      kochSegment(ctx, pts[i].x, pts[i].y, next.x, next.y, depth);
    }
    ctx.closePath();

    const grad = ctx.createLinearGradient(cx-r, cy, cx+r, cy);
    grad.addColorStop(0, 'rgba(74,184,216,0.3)');
    grad.addColorStop(1, 'rgba(62,207,202,0.3)');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#4ab8d8'; ctx.lineWidth = 1.5; ctx.stroke();

    ctx.fillStyle='rgba(200,200,230,0.6)'; ctx.font='11px monospace'; ctx.textAlign='center';
    const sides = 3 * Math.pow(4, depth);
    const len = Math.pow(1/3, depth).toFixed(6);
    ctx.fillText(`辺の数: ${sides.toLocaleString()}  各辺の長さ: (1/3)^${depth} = ${len}`, W/2, H-8);
  }

  iterSlider.addEventListener('input', () => { iterVal.textContent = iterSlider.value; draw(); });
  draw();
  window.addEventListener('resize', draw);
})();

// ===== 円錐曲線 =====
(function() {
  const container = document.getElementById('conic-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const eSlider = document.getElementById('conic-e');
  const eVal = document.getElementById('conic-e-val');

  function draw() {
    const W = canvas.width  = container.offsetWidth;
    const H = canvas.height = container.offsetHeight;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,W,H);

    const e = parseFloat(eSlider.value);
    const cx = W/2, cy = H/2;
    const scale = Math.min(W,H) * 0.15;

    // グリッド
    ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=1;
    [-3,-2,-1,0,1,2,3].forEach(i => {
      ctx.beginPath(); ctx.moveTo(cx+i*scale,0); ctx.lineTo(cx+i*scale,H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,cy+i*scale); ctx.lineTo(W,cy+i*scale); ctx.stroke();
    });
    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(0,cy); ctx.lineTo(W,cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx,0); ctx.lineTo(cx,H); ctx.stroke();

    // l (準距離)
    const l = scale * 1.5;

    // r = l / (1 + e cos θ) の極形式で描画
    ctx.beginPath();
    let first = true;
    for (let i = 0; i <= 2000; i++) {
      const θ = i / 2000 * 2 * Math.PI;
      const denom = 1 + e * Math.cos(θ);
      if (Math.abs(denom) < 0.01) { first = true; continue; }
      const r = l / denom;
      if (r < 0 || r > scale * 6) { first = true; continue; }
      const x = cx + r * Math.cos(θ);
      const y = cy - r * Math.sin(θ);
      if (first) { ctx.moveTo(x,y); first=false; }
      else ctx.lineTo(x,y);
    }

    const type = e < 1 ? '楕円' : e === 1 ? '放物線' : '双曲線';
    const color = e < 1 ? '#4ab8d8' : e < 1.01 ? '#f5c842' : '#f8706c';
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();

    // 焦点
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI*2);
    ctx.fillStyle = '#fde68a'; ctx.fill();

    ctx.fillStyle = 'rgba(200,200,230,0.7)'; ctx.font = '12px monospace'; ctx.textAlign = 'left';
    ctx.fillText(`e = ${e.toFixed(2)}  → ${type}`, 8, H-8);
  }

  eSlider.addEventListener('input', () => { eVal.textContent = parseFloat(eSlider.value).toFixed(2); draw(); });
  draw();
  window.addEventListener('resize', draw);
})();
// ===== メビウスの帯・トーラス・球面 (Three.js) =====
(function() {
  if (typeof THREE === 'undefined') return;
  const container = document.getElementById('topology-viz');
  if (!container) return;
  const typeSel = document.getElementById('topo-type');
  const speedSl = document.getElementById('topo-speed');
  const speedVal = document.getElementById('topo-speed-val');

  const W = container.clientWidth, H = 340;
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x080812);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
  camera.position.set(0, 1.5, 5.5);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.5;

  scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  const dL1 = new THREE.DirectionalLight(0xffffff, 0.9);
  dL1.position.set(5, 8, 5); scene.add(dL1);
  const dL2 = new THREE.DirectionalLight(0x6688ff, 0.4);
  dL2.position.set(-5, -3, -5); scene.add(dL2);

  // HSL→RGB ヘルパー
  function hsl2rgb(h, s, l) {
    const c = (1 - Math.abs(2*l-1)) * s;
    const x = c * (1 - Math.abs((h*6) % 2 - 1));
    const m = l - c/2;
    let r,g,b;
    const h6 = h * 6;
    if      (h6 < 1) { r=c; g=x; b=0; }
    else if (h6 < 2) { r=x; g=c; b=0; }
    else if (h6 < 3) { r=0; g=c; b=x; }
    else if (h6 < 4) { r=0; g=x; b=c; }
    else if (h6 < 5) { r=x; g=0; b=c; }
    else             { r=c; g=0; b=x; }
    return [r+m, g+m, b+m];
  }

  // メビウスの帯 — カスタムBufferGeometry
  function buildMobius() {
    const Nu = 160, Nv = 24, R = 1.5, w = 0.65;
    const pos = [], col = [], idx = [];
    for (let iu = 0; iu <= Nu; iu++) {
      for (let iv = 0; iv <= Nv; iv++) {
        const u = (iu / Nu) * 2 * Math.PI;
        const v = (iv / Nv - 0.5) * w;
        pos.push(
          (R + v * Math.cos(u/2)) * Math.cos(u),
          (R + v * Math.cos(u/2)) * Math.sin(u),
          v * Math.sin(u/2)
        );
        const [r,g,b] = hsl2rgb(iu / Nu, 0.78, 0.58);
        col.push(r, g, b);
      }
    }
    for (let iu = 0; iu < Nu; iu++) for (let iv = 0; iv < Nv; iv++) {
      const a=iu*(Nv+1)+iv, b=a+1, c=a+(Nv+1), d=c+1;
      idx.push(a,b,c, b,d,c);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.Float32BufferAttribute(col, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    return new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
      vertexColors: true, side: THREE.DoubleSide, shininess: 55
    }));
  }

  // トーラス
  function buildTorus() {
    const geo = new THREE.TorusGeometry(1.4, 0.52, 36, 100);
    const n = geo.attributes.position.count;
    const col = new Float32Array(n * 3);
    const p = geo.attributes.position;
    for (let i = 0; i < n; i++) {
      const u = ((Math.atan2(p.getY(i), p.getX(i)) / (2*Math.PI)) + 1) % 1;
      const [r,g,b] = hsl2rgb(u, 0.78, 0.58);
      col[i*3]=r; col[i*3+1]=g; col[i*3+2]=b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 65 }));
  }

  // 球面
  function buildSphere() {
    const geo = new THREE.SphereGeometry(1.7, 52, 36);
    const n = geo.attributes.position.count;
    const col = new Float32Array(n * 3);
    const p = geo.attributes.position;
    for (let i = 0; i < n; i++) {
      const u = ((Math.atan2(p.getX(i), p.getZ(i)) / (2*Math.PI)) + 1) % 1;
      const [r,g,b] = hsl2rgb(u, 0.78, 0.58);
      col[i*3]=r; col[i*3+1]=g; col[i*3+2]=b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 65 }));
  }

  const descMap = {
    mobius: 'メビウスの帯 — χ=0, 向きなし曲面, 境界1本',
    torus:  'トーラス T² — χ=0, 種数1, 向きあり閉曲面',
    sphere: '球面 S² — χ=2, 種数0, 単連結'
  };

  function makeLabel(text) {
    const cv = document.createElement('canvas'); cv.width = 640; cv.height = 52;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = 'rgba(185,205,245,0.92)';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, 320, 34);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true }));
    sp.position.set(0, -2.8, 0);
    sp.scale.set(7, 0.6, 1);
    return sp;
  }

  let mesh = null, label = null;

  function rebuild() {
    if (mesh)  { scene.remove(mesh);  mesh.geometry.dispose();  mesh.material.dispose(); }
    if (label) { scene.remove(label); label.material.map.dispose(); label.material.dispose(); }
    const t = typeSel.value;
    mesh  = t==='mobius' ? buildMobius() : t==='torus' ? buildTorus() : buildSphere();
    label = makeLabel(descMap[t]);
    scene.add(mesh); scene.add(label);
  }

  typeSel.addEventListener('change', rebuild);
  speedSl.addEventListener('input', () => {
    speedVal.textContent = parseFloat(speedSl.value).toFixed(1);
    controls.autoRotateSpeed = parseFloat(speedSl.value) * 1.5;
  });
  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    renderer.setSize(w, H);
    camera.aspect = w / H;
    camera.updateProjectionMatrix();
  });

  rebuild();
  (function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  })();
})();

// ===== 曲率の可視化 =====
(function() {
  const container = document.getElementById('curvature-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const fnSel=document.getElementById('curv-fn');
  const tSl=document.getElementById('curv-t');
  const tVal=document.getElementById('curv-t-val');

  const curves = {
    sin:    {f:x=>Math.sin(x), df:x=>Math.cos(x), d2f:x=>-Math.sin(x), label:'y=sin(x)', xMin:-5,xMax:5,yMin:-2,yMax:2},
    x2:     {f:x=>x*x,         df:x=>2*x,          d2f:x=>2,             label:'y=x²',     xMin:-2.5,xMax:2.5,yMin:-0.5,yMax:4},
    x3:     {f:x=>x*x*x,       df:x=>3*x*x,        d2f:x=>6*x,           label:'y=x³',     xMin:-2,xMax:2,yMin:-4,yMax:4},
    circle: {
      // 媒介変数 x=cos(t), y=sin(t)
      f:t=>Math.sin(t), df:t=>Math.cos(t), d2f:t=>-Math.sin(t),
      fx:t=>Math.cos(t), dfx:t=>-Math.sin(t), d2fx:t=>-Math.cos(t),
      label:'円 r=1', xMin:-2,xMax:2,yMin:-2,yMax:2,
      parametric:true
    },
  };

  function draw() {
    const W=canvas.width=container.offsetWidth, H=canvas.height=container.offsetHeight;
    const ctx=canvas.getContext('2d');
    const dpr=window.devicePixelRatio||1;
    canvas.width=W*dpr; canvas.height=H*dpr; ctx.scale(dpr,dpr);
    ctx.clearRect(0,0,W,H);

    const cv=curves[fnSel.value];
    const t0=parseFloat(tSl.value);
    const {xMin,xMax,yMin,yMax}=cv;
    const pad=35;

    function sx(x){return pad+(x-xMin)/(xMax-xMin)*(W-2*pad);}
    function sy(y){return pad+(1-(y-yMin)/(yMax-yMin))*(H-2*pad);}

    // グリッド・軸
    ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=1;
    for(let x=Math.ceil(xMin);x<=xMax;x++){ctx.beginPath();ctx.moveTo(sx(x),pad);ctx.lineTo(sx(x),H-pad);ctx.stroke();}
    for(let y=Math.ceil(yMin);y<=yMax;y++){ctx.beginPath();ctx.moveTo(pad,sy(y));ctx.lineTo(W-pad,sy(y));ctx.stroke();}
    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(pad,sy(0));ctx.lineTo(W-pad,sy(0));ctx.stroke();
    ctx.beginPath();ctx.moveTo(sx(0),pad);ctx.lineTo(sx(0),H-pad);ctx.stroke();

    // 曲線
    ctx.beginPath(); let first=true;
    if(cv.parametric){
      for(let i=0;i<=400;i++){
        const t=xMin+(xMax-xMin)*i/400;
        const p={x:sx(cv.fx(t)),y:sy(cv.f(t))};
        if(first){ctx.moveTo(p.x,p.y);first=false;}else ctx.lineTo(p.x,p.y);
      }
    } else {
      for(let i=0;i<=400;i++){
        const x=xMin+(xMax-xMin)*i/400;
        const y=cv.f(x);
        if(!isFinite(y)||y<yMin-1||y>yMax+1){first=true;continue;}
        const p={x:sx(x),y:sy(y)};
        if(first){ctx.moveTo(p.x,p.y);first=false;}else ctx.lineTo(p.x,p.y);
      }
    }
    ctx.strokeStyle='#4ab8d8'; ctx.lineWidth=2.5; ctx.stroke();

    // 接触点での曲率
    let x0,y0,kappa,tanAngle;
    if(cv.parametric){
      x0=cv.fx(t0); y0=cv.f(t0);
      const dxt=cv.dfx(t0), dyt=cv.df(t0);
      const d2xt=cv.d2fx(t0), d2yt=cv.d2f(t0);
      kappa=Math.abs(dxt*d2yt-dyt*d2xt)/Math.pow(dxt*dxt+dyt*dyt,1.5);
      tanAngle=Math.atan2(dyt,dxt);
    } else {
      x0=t0; y0=cv.f(t0);
      const dy=cv.df(t0), d2y=cv.d2f(t0);
      kappa=Math.abs(d2y)/Math.pow(1+dy*dy,1.5);
      tanAngle=Math.atan2(dy,1);
    }

    // 曲率半径 R=1/κ
    const R=kappa>0.001?1/kappa:1000;
    // 曲率中心の方向（法線方向）
    const normalAngle=tanAngle+Math.PI/2;
    const sign = cv.parametric?1:(cv.d2f(t0)>0?1:-1);
    const centerX=x0+sign*R*Math.cos(normalAngle);
    const centerY=y0+sign*R*Math.sin(normalAngle);

    // 接線
    const tl=0.8;
    ctx.strokeStyle='rgba(245,200,66,0.7)'; ctx.lineWidth=1.8;
    ctx.beginPath();
    ctx.moveTo(sx(x0-tl*Math.cos(tanAngle)),sy(y0-tl*Math.sin(tanAngle)));
    ctx.lineTo(sx(x0+tl*Math.cos(tanAngle)),sy(y0+tl*Math.sin(tanAngle)));
    ctx.stroke();

    // 曲率円（接触円）
    if(R<6){
      const rPx=R*(W-2*pad)/(xMax-xMin);
      ctx.beginPath(); ctx.arc(sx(centerX),sy(centerY),rPx,0,Math.PI*2);
      ctx.strokeStyle='rgba(109,204,152,0.6)'; ctx.lineWidth=1.5; ctx.setLineDash([5,3]); ctx.stroke(); ctx.setLineDash([]);
      // 中心点
      ctx.beginPath(); ctx.arc(sx(centerX),sy(centerY),4,0,Math.PI*2);
      ctx.fillStyle='#6dcc98'; ctx.fill();
      // 曲率半径の線
      ctx.strokeStyle='rgba(109,204,152,0.4)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(sx(centerX),sy(centerY)); ctx.lineTo(sx(x0),sy(y0)); ctx.stroke();
    }

    // 点
    ctx.beginPath(); ctx.arc(sx(x0),sy(y0),6,0,Math.PI*2);
    ctx.fillStyle='#fde68a'; ctx.fill(); ctx.strokeStyle='white'; ctx.lineWidth=1.5; ctx.stroke();

    // 情報
    ctx.fillStyle='rgba(200,200,230,0.7)'; ctx.font='11px monospace'; ctx.textAlign='left';
    ctx.fillText(`κ = ${kappa.toFixed(4)}  R = ${R<999?R.toFixed(3):'∞'}`, pad+4, pad+14);
    ctx.fillStyle='rgba(245,200,66,0.8)'; ctx.fillText(`接線 (黄)`, pad+4, pad+28);
    ctx.fillStyle='rgba(109,204,152,0.8)'; ctx.fillText(`接触円 (緑)  R=1/κ`, pad+4, pad+42);
  }

  fnSel.addEventListener('change',draw);
  tSl.addEventListener('input',()=>{tVal.textContent=parseFloat(tSl.value).toFixed(2);draw();});
  draw();
  window.addEventListener('resize',draw);
})();

// ===== リサージュ曲線 =====
(function() {
  const container = document.getElementById('lissajous-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const aSlider=document.getElementById('lis-a'), bSlider=document.getElementById('lis-b'), dSlider=document.getElementById('lis-delta');
  const aVal=document.getElementById('lis-a-val'), bVal=document.getElementById('lis-b-val'), dVal=document.getElementById('lis-delta-val');
  let t=0, animId;

  function draw() {
    const W=canvas.width=container.offsetWidth, H=canvas.height=container.offsetHeight;
    const ctx=canvas.getContext('2d');
    const dpr=window.devicePixelRatio||1;
    canvas.width=W*dpr; canvas.height=H*dpr; ctx.scale(dpr,dpr);
    ctx.clearRect(0,0,W,H);

    const a=parseInt(aSlider.value), b=parseInt(bSlider.value);
    const δ=parseFloat(dSlider.value)*Math.PI/180;
    const R=Math.min(W,H)*0.42, cx=W/2, cy=H/2;

    ctx.beginPath();
    const N=2000;
    for(let i=0;i<=N;i++){
      const θ=i/N*2*Math.PI*Math.max(a,b);
      const x=cx+R*Math.sin(a*θ+δ);
      const y=cy+R*Math.sin(b*θ);
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    const g=ctx.createLinearGradient(cx-R,cy,cx+R,cy);
    g.addColorStop(0,'rgba(74,184,216,0.9)'); g.addColorStop(0.5,'rgba(109,204,152,0.9)'); g.addColorStop(1,'rgba(124,108,248,0.9)');
    ctx.strokeStyle=g; ctx.lineWidth=1.8; ctx.stroke();

    // 動点
    const θ=t;
    const px=cx+R*Math.sin(a*θ+δ), py=cy+R*Math.sin(b*θ);
    ctx.beginPath(); ctx.arc(px,py,5,0,Math.PI*2);
    ctx.fillStyle='#7dd3fc'; ctx.fill();

    ctx.fillStyle='rgba(200,200,230,0.6)'; ctx.font='11px monospace'; ctx.textAlign='center';
    ctx.fillText(`x=sin(${a}θ+${dSlider.value}°)  y=sin(${b}θ)`, W/2, H-8);

    t+=0.05;
    animId=requestAnimationFrame(draw);
  }

  [aSlider,bSlider,dSlider].forEach((s,i)=>{
    s.addEventListener('input',()=>{
      [aVal,bVal,dVal][i].textContent=s.value+(i===2?'°':'');
    });
  });
  draw();
  window.addEventListener('resize', ()=>{cancelAnimationFrame(animId); draw();});
})();

// ===== 極座標曲線 =====
(function() {
  const container = document.getElementById('polar-viz');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const typeSelect = document.getElementById('polar-type');

  const curves = {
    rose3:    {f: θ=>Math.abs(Math.cos(3*θ)), range:Math.PI, label:'r = cos(3θ)'},
    rose4:    {f: θ=>Math.abs(Math.cos(2*θ)), range:2*Math.PI, label:'r = cos(2θ)'},
    cardioid: {f: θ=>1+Math.cos(θ), range:2*Math.PI, label:'r = 1+cos(θ)'},
    archimedes:{f: θ=>θ/(4*Math.PI), range:4*Math.PI, label:'r = θ/2π (0≤θ≤4π)'},
    lemniscate:{f: θ=>{const v=Math.cos(2*θ);return v>=0?Math.sqrt(v):NaN;}, range:2*Math.PI, label:'r² = cos(2θ)'},
  };

  function draw() {
    const W=canvas.width=container.offsetWidth, H=canvas.height=container.offsetHeight;
    const ctx=canvas.getContext('2d');
    ctx.clearRect(0,0,W,H);
    const cx=W/2, cy=H/2, R=Math.min(W,H)*0.4;
    const curve=curves[typeSelect.value];

    // 極グリッド
    ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=1;
    [0.25,0.5,0.75,1.0].forEach(r=>{
      ctx.beginPath(); ctx.arc(cx,cy,R*r,0,Math.PI*2); ctx.stroke();
    });
    [0,1,2,3].forEach(i=>{
      const a=i*Math.PI/4;
      ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+R*Math.cos(a)*1.05,cy+R*Math.sin(a)*1.05);ctx.stroke();
      ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx-R*Math.cos(a)*1.05,cy-R*Math.sin(a)*1.05);ctx.stroke();
    });
    ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(0,cy);ctx.lineTo(W,cy);ctx.stroke();
    ctx.beginPath();ctx.moveTo(cx,0);ctx.lineTo(cx,H);ctx.stroke();

    // 曲線
    ctx.beginPath();
    let first=true;
    const N=2000;
    for(let i=0;i<=N;i++){
      const θ=curve.range*i/N;
      const r=curve.f(θ);
      if(!isFinite(r)||isNaN(r)){first=true;continue;}
      const x=cx+R*r*Math.cos(θ), y=cy-R*r*Math.sin(θ);
      if(first){ctx.moveTo(x,y);first=false;}else ctx.lineTo(x,y);
    }
    const g=ctx.createLinearGradient(cx-R,cy,cx+R,cy);
    g.addColorStop(0,'rgba(74,184,216,0.9)'); g.addColorStop(0.5,'rgba(62,207,202,0.9)'); g.addColorStop(1,'rgba(109,204,152,0.9)');
    ctx.strokeStyle=g; ctx.lineWidth=2.5; ctx.stroke();

    ctx.fillStyle='rgba(200,200,230,0.6)'; ctx.font='12px monospace'; ctx.textAlign='center';
    ctx.fillText(curve.label, W/2, H-8);
  }

  typeSelect.addEventListener('change', draw);
  draw();
  window.addEventListener('resize', draw);
})();

// ===== 正多面体 (Three.js) =====
(function() {
  if (typeof THREE === 'undefined') return;
  const container = document.getElementById('polyhedron-viz');
  if (!container) return;
  const typeSelect = document.getElementById('poly-type');

  const W = container.clientWidth, H = 340;
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x080812);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
  camera.position.set(0, 1.5, 5.5);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.2;

  scene.add(new THREE.AmbientLight(0xffffff, 0.38));
  const dL1 = new THREE.DirectionalLight(0xffffff, 0.95);
  dL1.position.set(5, 8, 6); scene.add(dL1);
  const dL2 = new THREE.DirectionalLight(0x8899ff, 0.4);
  dL2.position.set(-5, -4, -5); scene.add(dL2);

  const polyData = {
    tetra:  { name:'正四面体',  V:4,  E:6,  F:4,  color:0xf8706c, radius:1.7, geo: 'Tetrahedron'  },
    cube:   { name:'立方体',    V:8,  E:12, F:6,  color:0x8c7cf8, radius:1.3, geo: 'Box'          },
    octa:   { name:'正八面体',  V:6,  E:12, F:8,  color:0x3ecfca, radius:1.7, geo: 'Octahedron'   },
    dodeca: { name:'正十二面体',V:20, E:30, F:12, color:0x6dcc98, radius:1.5, geo: 'Dodecahedron' },
    icosa:  { name:'正二十面体',V:12, E:30, F:20, color:0xf5c842, radius:1.6, geo: 'Icosahedron'  },
  };

  function makeGeo(pd) {
    if (pd.geo === 'Box') return new THREE.BoxGeometry(pd.radius*1.5, pd.radius*1.5, pd.radius*1.5);
    return new THREE[pd.geo + 'Geometry'](pd.radius);
  }

  let solidMesh = null, wireMesh = null, label = null;

  function rebuild() {
    if (solidMesh) { scene.remove(solidMesh); solidMesh.geometry.dispose(); solidMesh.material.dispose(); }
    if (wireMesh)  { scene.remove(wireMesh);  wireMesh.geometry.dispose();  wireMesh.material.dispose();  }
    if (label)     { scene.remove(label); label.material.map.dispose(); label.material.dispose(); }

    const pd = polyData[typeSelect.value];
    const geo = makeGeo(pd);

    // 半透明ソリッド面
    solidMesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
      color: pd.color, shininess: 60,
      transparent: true, opacity: 0.78,
      side: THREE.FrontSide
    }));
    scene.add(solidMesh);

    // ワイヤーフレームオーバーレイ
    wireMesh = new THREE.LineSegments(
      new THREE.WireframeGeometry(geo),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 })
    );
    scene.add(wireMesh);

    // 頂点マーカー (小球)
    const positions = geo.attributes.position;
    const seen = new Set();
    for (let i = 0; i < positions.count; i++) {
      const key = [positions.getX(i), positions.getY(i), positions.getZ(i)].map(v=>v.toFixed(4)).join(',');
      if (seen.has(key)) continue;
      seen.add(key);
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      dot.position.set(positions.getX(i), positions.getY(i), positions.getZ(i));
      solidMesh.add(dot);
    }

    // ラベルスプライト
    const cv = document.createElement('canvas'); cv.width = 640; cv.height = 52;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = 'rgba(200,215,250,0.92)';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${pd.name}  V=${pd.V},  E=${pd.E},  F=${pd.F}  →  V−E+F = ${pd.V-pd.E+pd.F}`, 320, 34);
    label = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true }));
    label.position.set(0, -2.6, 0);
    label.scale.set(7.5, 0.65, 1);
    scene.add(label);
  }

  typeSelect.addEventListener('change', rebuild);
  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    renderer.setSize(w, H);
    camera.aspect = w / H;
    camera.updateProjectionMatrix();
  });

  rebuild();
  (function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  })();
})();

// ===== 双曲幾何 =====
(()=>{
  const container=document.getElementById('hyperbolic-viz');
  const canvas=document.createElement('canvas'); container.appendChild(canvas);
  const ctx=canvas.getContext('2d');
  const modeSel=document.getElementById('hyp-mode');

  // ポアンカレ円盤の測地線: 境界円に直交する円弧(または直径)
  // 2点 p1, p2 (単位円内) を通る測地線を描く
  function geodesicArc(ctx, p1, p2, cx, cy, R){
    // 単位円座標 → canvas座標変換
    const toC=p=>[cx+p[0]*R, cy-p[1]*R];
    const [x1,y1]=p1, [x2,y2]=p2;
    // p1, p2 の反転点を求めて外接円を計算
    // 直径を通るケース: y1*x2 ≈ x1*y2
    if(Math.abs(x1*y2-x2*y1)<1e-6){
      const [ax,ay]=toC(p1), [bx,by]=toC(p2);
      ctx.moveTo(ax,ay); ctx.lineTo(bx,by);
      return;
    }
    // 3点 (p1, p2, inversion_of_p1) を通る円
    // inversion: p* = p/|p|²
    const inv=[x1/(x1*x1+y1*y1), y1/(x1*x1+y1*y1)];
    // 3点の外接円
    const ax=x1,ay=y1,bx=x2,by=y2,ex=inv[0],ey=inv[1];
    const D=2*(ax*(by-ey)+bx*(ey-ay)+ex*(ay-by));
    if(Math.abs(D)<1e-10) return;
    const ux=((ax*ax+ay*ay)*(by-ey)+(bx*bx+by*by)*(ey-ay)+(ex*ex+ey*ey)*(ay-by))/D;
    const uy=((ax*ax+ay*ay)*(ex-bx)+(bx*bx+by*by)*(ax-ex)+(ex*ex+ey*ey)*(bx-ax))/D;
    const ur=Math.sqrt((ax-ux)*(ax-ux)+(ay-uy)*(ay-uy));
    // 角度
    const ang1=Math.atan2(ay-uy,ax-ux), ang2=Math.atan2(by-uy,bx-ux);
    const ccx=cx+ux*R, ccy=cy-uy*R;
    ctx.arc(ccx,ccy,ur*R, -ang1, -ang2, (ang2-ang1+2*Math.PI)%(2*Math.PI)>Math.PI);
  }

  function draw(){
    const W=container.clientWidth||600, H=container.clientHeight||300;
    canvas.width=W*devicePixelRatio; canvas.height=H*devicePixelRatio;
    canvas.style.width=W+'px'; canvas.style.height=H+'px';
    ctx.scale(devicePixelRatio,devicePixelRatio);
    ctx.fillStyle='#0d0f14'; ctx.fillRect(0,0,W,H);

    const mode=modeSel.value;
    const cx=W/2, cy=H/2, R=Math.min(W,H)*0.43;

    // 境界円
    ctx.beginPath(); ctx.arc(cx,cy,R,0,2*Math.PI);
    ctx.fillStyle='rgba(74,184,216,0.04)'; ctx.fill();
    ctx.strokeStyle='rgba(74,184,216,0.5)'; ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle='rgba(74,184,216,0.3)'; ctx.font='10px sans-serif'; ctx.textAlign='center';
    ctx.fillText('∂D (無限遠)',cx,cy-R-6);

    if(mode==='geodesics'){
      // いくつかの測地線を描く
      const lines=[
        [[-0.8,0],[0.8,0]],   // 直径
        [[-0.5,-0.3],[0.6,0.5]],
        [[-0.2,0.7],[0.5,-0.6]],
        [[0.1,0.8],[0.8,-0.2]],
        [[-0.7,0.4],[-0.1,-0.8]],
        [[0.3,0.6],[-0.8,-0.1]],
      ];
      lines.forEach(([p1,p2],i)=>{
        ctx.beginPath();
        geodesicArc(ctx,p1,p2,cx,cy,R);
        ctx.strokeStyle=`hsla(${190+i*25},70%,60%,0.7)`; ctx.lineWidth=1.5; ctx.stroke();
        // 端点
        [[...p1],[...p2]].forEach(p=>{
          ctx.beginPath(); ctx.arc(cx+p[0]*R,cy-p[1]*R,3,0,2*Math.PI);
          ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.fill();
        });
      });
      // 中心の点
      ctx.beginPath(); ctx.arc(cx,cy,5,0,2*Math.PI);
      ctx.fillStyle='rgba(245,200,66,0.9)'; ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.font='11px sans-serif'; ctx.textAlign='left';
      ctx.fillText('O',cx+8,cy-4);
      ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='10px sans-serif'; ctx.textAlign='center';
      ctx.fillText('「平行線」が無数に存在',cx,cy+R+18);
    } else {
      // {5,4} タイリング (簡略: 同心的な五角形のグループ)
      const drawPentagon=(cr,scale,color)=>{
        ctx.beginPath();
        for(let k=0;k<=5;k++){
          const ang=-Math.PI/2+2*Math.PI*k/5;
          const px=cx+cr*scale*Math.cos(ang)*R;
          const py=cy+cr*scale*Math.sin(ang)*R;
          if(k===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
        }
        ctx.closePath();
        ctx.strokeStyle=color; ctx.lineWidth=1; ctx.stroke();
      };
      const scales=[0.15,0.32,0.52,0.7,0.85,0.95];
      scales.forEach((s,i)=>{
        for(let k=0;k<(i+1);k++){
          const ang=2*Math.PI*k/(i+1);
          const cr=i===0?0:0.5*(1-s);
          drawPentagon(i===0?0:Math.cos(Math.PI/(i+1)),s,`hsla(${200+i*20},70%,55%,0.6)`);
        }
      });
      ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='10px sans-serif'; ctx.textAlign='center';
      ctx.fillText('{5,4} タイリング: 全ての五角形が合同（双曲距離で）',cx,cy+R+18);
    }
  }

  modeSel.addEventListener('change',draw);
  draw(); window.addEventListener('resize',draw);
})();

// ===== ホモトピー =====
(()=>{
  const container=document.getElementById('homotopy-viz');
  const canvas=document.createElement('canvas'); container.appendChild(canvas);
  const ctx=canvas.getContext('2d');
  const tSl=document.getElementById('homo-t'), tVal=document.getElementById('homo-t-val');
  const spaceSel=document.getElementById('homo-space');

  function draw(){
    const W=container.clientWidth||600, H=container.clientHeight||300;
    canvas.width=W*devicePixelRatio; canvas.height=H*devicePixelRatio;
    canvas.style.width=W+'px'; canvas.style.height=H+'px';
    ctx.scale(devicePixelRatio,devicePixelRatio);
    ctx.fillStyle='#0d0f14'; ctx.fillRect(0,0,W,H);

    const t=parseInt(tSl.value)/100;
    tVal.textContent=Math.round(t*100)+'%';
    const space=spaceSel.value;
    const cx=W/2, cy=H/2, baseR=Math.min(W,H)*0.35;

    // 空間の描画
    if(space==='annulus'){
      // 外円
      ctx.beginPath(); ctx.arc(cx,cy,baseR,0,2*Math.PI);
      ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=1; ctx.stroke();
      // 穴
      const holeR=baseR*0.25;
      ctx.beginPath(); ctx.arc(cx,cy,holeR,0,2*Math.PI);
      ctx.fillStyle='rgba(248,112,108,0.15)'; ctx.fill();
      ctx.strokeStyle='rgba(248,112,108,0.4)'; ctx.lineWidth=1.5; ctx.stroke();
      ctx.fillStyle='rgba(248,112,108,0.5)'; ctx.font='10px sans-serif'; ctx.textAlign='center';
      ctx.fillText('穴 (障害)',cx,cy+holeR+14);
    }

    // ループの描画: t=0は大きな円, t=1は点
    const loopR=space==='plane'
      ? baseR*(1-t*0.95)  // 縮小可能
      : Math.max(baseR*0.28, baseR*(1-t*0.65)); // 穴を迂回できず止まる

    const N=120;
    ctx.beginPath();
    for(let i=0;i<=N;i++){
      const ang=2*Math.PI*i/N;
      const px=cx+loopR*Math.cos(ang), py=cy+loopR*Math.sin(ang);
      if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
    }
    ctx.closePath();
    const col=space==='plane'?'rgba(62,207,202,0.8)':'rgba(74,184,216,0.8)';
    ctx.strokeStyle=col; ctx.lineWidth=2.5; ctx.stroke();

    // 基点
    ctx.beginPath(); ctx.arc(cx+loopR,cy,6,0,2*Math.PI);
    ctx.fillStyle='rgba(245,200,66,0.9)'; ctx.fill();

    // 状態テキスト
    ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.font='bold 11px sans-serif'; ctx.textAlign='center';
    if(space==='plane'){
      ctx.fillText(t>0.9?'収縮完了! π₁(ℝ²) = 0 (自明)':'ループを縮小中…',cx,H-16);
    } else {
      ctx.fillText(t>0.6?'穴に引っかかって縮小不可! π₁(環) = ℤ':'縮小しようとしているが…',cx,H-16);
    }
  }

  tSl.addEventListener('input',draw);
  spaceSel.addEventListener('change',()=>{tSl.value=0;draw();});
  draw(); window.addEventListener('resize',draw);
})();

// ===== ファイバー束 =====
(()=>{
  const container=document.getElementById('fiberbundle-viz');
  const canvas=document.createElement('canvas'); container.appendChild(canvas);
  const ctx=canvas.getContext('2d');
  const typeSel=document.getElementById('fb-type');
  const rotSl=document.getElementById('fb-rot'), rotVal=document.getElementById('fb-rot-val');

  function draw(){
    const W=container.clientWidth||600, H=container.clientHeight||280;
    canvas.width=W*devicePixelRatio; canvas.height=H*devicePixelRatio;
    canvas.style.width=W+'px'; canvas.style.height=H+'px';
    ctx.scale(devicePixelRatio,devicePixelRatio);
    ctx.fillStyle='#0d0f14'; ctx.fillRect(0,0,W,H);

    const type=typeSel.value;
    const rot=parseFloat(rotSl.value)*Math.PI/180;
    rotVal.textContent=rotSl.value+'°';

    const cx=W/2, cy=H/2;
    const baseR=Math.min(W,H)*0.28, fiberLen=Math.min(W,H)*0.18;
    const N=32;

    // 底空間 S¹ を楕円として描く（3D投影風）
    const ex=baseR, ey=baseR*0.35;
    ctx.beginPath();
    for(let i=0;i<=N;i++){
      const ang=2*Math.PI*i/N;
      const px=cx+ex*Math.cos(ang), py=cy+ey*Math.sin(ang)+fiberLen*0.3;
      if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
    }
    ctx.strokeStyle='rgba(74,184,216,0.4)'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.fillStyle='rgba(74,184,216,0.5)'; ctx.font='10px sans-serif'; ctx.textAlign='left';
    ctx.fillText('底空間 S¹', cx+ex+6, cy+fiberLen*0.3);

    // ファイバー (各点に垂直な線分)
    for(let i=0;i<N;i++){
      const baseAng=2*Math.PI*i/N+rot;
      const bx=cx+ex*Math.cos(baseAng), by=cy+ey*Math.sin(baseAng)+fiberLen*0.3;

      let tilt;
      if(type==='trivial'){
        tilt=0; // 全て同じ向き
      } else {
        // メビウス: 一周すると向きが反転 → tilt = baseAng/2
        tilt=baseAng/2;
      }

      // ファイバー方向 (法線方向にtiltだけ傾ける)
      const nx=-Math.sin(baseAng), ny=Math.cos(baseAng)*ey/ex;
      const nlen=Math.sqrt(nx*nx+ny*ny)||1;
      const fx=nx/nlen*Math.cos(tilt)-0*Math.sin(tilt);
      const fy=ny/nlen*Math.cos(tilt)+1*Math.sin(tilt)*0.4;

      const alpha=Math.abs(Math.cos(baseAng-rot))*0.6+0.2;
      ctx.strokeStyle=`rgba(${type==='trivial'?'62,207,202':'248,112,108'},${alpha})`;
      ctx.lineWidth=1.2;
      ctx.beginPath();
      ctx.moveTo(bx-fx*fiberLen*0.5, by-fy*fiberLen*0.5);
      ctx.lineTo(bx+fx*fiberLen*0.5, by+fy*fiberLen*0.5);
      ctx.stroke();
    }

    ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.font='bold 11px sans-serif'; ctx.textAlign='center';
    ctx.fillText(type==='trivial'?'自明束: 全ファイバーが同方向 → 円柱':'メビウス束: 一周すると向きが反転 → ねじれあり', W/2, H-14);
  }

  typeSel.addEventListener('change',draw);
  rotSl.addEventListener('input',draw);
  draw(); window.addEventListener('resize',draw);
})();

// ===== ガウス曲率 — 曲面分類 (Three.js) =====
(function() {
  if (typeof THREE === 'undefined') return;
  const container = document.getElementById('gaussian-viz');
  if (!container) return;
  const surfSel  = document.getElementById('gauss-surface');
  const wireSl   = document.getElementById('gauss-wire');
  const wireVal  = document.getElementById('gauss-wire-val');

  const W = container.clientWidth, H = 380;
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x080812);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 200);
  camera.position.set(0, 6, 18);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const dLight = new THREE.DirectionalLight(0xffffff, 0.9);
  dLight.position.set(5, 10, 8);
  scene.add(dLight);
  const dLight2 = new THREE.DirectionalLight(0x8899ff, 0.4);
  dLight2.position.set(-5, -5, -5);
  scene.add(dLight2);

  // ラベルスプライト
  function makeLabel(text, pos, col) {
    const cv = document.createElement('canvas'); cv.width = 200; cv.height = 48;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = col || '#ccddff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, 100, 36);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true }));
    sp.position.set(...pos);
    sp.scale.set(4, 1, 1);
    return sp;
  }

  const objects = [];

  // --- 球面 (K > 0) ---
  function makeSphere(xOffset) {
    const geo = new THREE.SphereGeometry(1.8, 40, 40);
    const col = new Float32Array(geo.attributes.position.count * 3);
    for (let i = 0; i < col.length; i += 3) { col[i]=0.3; col[i+1]=0.7; col[i+2]=1.0; }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    const mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
      vertexColors: true, shininess: 60, side: THREE.FrontSide
    }));
    mesh.position.x = xOffset;
    return mesh;
  }

  // --- 平面 (K = 0) ---
  function makePlane(xOffset) {
    const N = 30;
    const positions = [], colors = [];
    for (let i = 0; i <= N; i++) {
      for (let j = 0; j <= N; j++) {
        const x = (i/N - 0.5) * 4 + xOffset;
        const y = (j/N - 0.5) * 4;
        positions.push(x, 0, y);
        colors.push(0.4, 0.9, 0.5);
      }
    }
    const indices = [];
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const a = i*(N+1)+j, b=a+1, c=a+(N+1), d=c+1;
      indices.push(a,b,c,b,d,c);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
      vertexColors: true, side: THREE.DoubleSide, shininess: 20
    }));
  }

  // --- 双曲面/鞍面 (K < 0) ---
  function makeSaddle(xOffset) {
    const N = 40;
    const positions = [], colors = [], indices = [];
    const size = 2.0;
    for (let i = 0; i <= N; i++) {
      for (let j = 0; j <= N; j++) {
        const u = (i/N - 0.5) * size * 2;
        const v = (j/N - 0.5) * size * 2;
        const x = u + xOffset;
        const y = u*u - v*v;  // saddle: z = x² - y²
        const z = v;
        positions.push(x, y * 0.5, z);
        // 曲率が強い部分(端)は赤、中央は青紫
        const k = Math.min(1, (u*u + v*v) / (size*size));
        colors.push(0.3 + k*0.6, 0.1, 0.8 - k*0.5);
      }
    }
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const a = i*(N+1)+j, b=a+1, c=a+(N+1), d=c+1;
      indices.push(a,b,c,b,d,c);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
      vertexColors: true, side: THREE.DoubleSide, shininess: 30
    }));
  }

  const sphere = makeSphere(-6);
  const plane  = makePlane(0);
  const saddle = makeSaddle(6);
  objects.push(sphere, plane, saddle);
  objects.forEach(o => scene.add(o));

  scene.add(makeLabel('K > 0  球面', [-6, -3, 0], '#55ccff'));
  scene.add(makeLabel('K = 0  平面', [0,  -3, 0], '#55ee88'));
  scene.add(makeLabel('K < 0  鞍面', [6,  -3, 0], '#ff88aa'));

  // ワイヤーフレームオーバーレイ
  const wireframes = objects.map(o => {
    const wf = new THREE.WireframeGeometry(o.geometry);
    const line = new THREE.LineSegments(wf, new THREE.LineBasicMaterial({ color: 0x334466, transparent: true, opacity: 0.3 }));
    line.position.copy(o.position);
    return line;
  });
  wireframes.forEach(w => { scene.add(w); w.visible = false; });

  function updateWireframe() {
    const on = parseInt(wireSl.value) === 1;
    wireVal.textContent = on ? 'ON' : 'OFF';
    objects.forEach(o => { o.material.wireframe = on; });
    wireframes.forEach(w => { w.visible = false; });
  }

  function updateVisibility() {
    const sel = surfSel.value;
    sphere.visible = sel === 'all' || sel === 'sphere';
    plane.visible  = sel === 'all' || sel === 'plane';
    saddle.visible = sel === 'all' || sel === 'saddle';
    if (sel === 'all')    camera.position.set(0, 6, 18);
    else if (sel === 'sphere') camera.position.set(-6, 4, 10);
    else if (sel === 'plane')  camera.position.set(0, 8, 10);
    else                       camera.position.set(6, 4, 10);
    controls.target.set(
      sel==='sphere'?-6 : sel==='saddle'?6 : 0,
      0, 0
    );
  }

  surfSel.addEventListener('change', updateVisibility);
  wireSl.addEventListener('input', updateWireframe);

  function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    renderer.setSize(w, H);
    camera.aspect = w / H;
    camera.updateProjectionMatrix();
  });

  updateVisibility();
  animate();
})();

// ===== リーマン面 — 複素関数の多価性 (Three.js) =====
(function() {
  if (typeof THREE === 'undefined') return;
  const container = document.getElementById('riemann-surface-viz');
  if (!container) return;
  const funcSel = document.getElementById('rs-func');

  const W = container.clientWidth, H = 380;
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x060810);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
  camera.position.set(3, 4, 6);
  camera.lookAt(0, 0, 0);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const dLight = new THREE.DirectionalLight(0xffffff, 0.9);
  dLight.position.set(4, 8, 5);
  scene.add(dLight);
  const dLight2 = new THREE.DirectionalLight(0x4466ff, 0.4);
  dLight2.position.set(-4, -4, -4);
  scene.add(dLight2);

  // HSVからRGBへ (シート識別に使用)
  function hsv2rgb(h, s, v) {
    const i = Math.floor(h * 6);
    const f = h*6-i, p=v*(1-s), q=v*(1-f*s), t=v*(1-(1-f)*s);
    const m = [[v,t,p],[q,v,p],[p,v,t],[p,q,v],[t,p,v],[v,p,q]][i%6];
    return m;
  }

  let meshes = [];

  function clearMeshes() {
    meshes.forEach(m => { scene.remove(m); m.geometry.dispose(); m.material.dispose(); });
    meshes = [];
  }

  // √z リーマン面: 2枚のシート
  // z = r*e^{iθ}, √z = √r * e^{iθ/2}
  // 3D: x=Re(z)=r cosθ, z_3d=Im(z)=r sinθ, y=Im(√z)=√r sin(θ/2) (シートごとに±)
  function buildSqrt() {
    const Nr = 40, Nth = 120;
    for (let sheet = 0; sheet < 2; sheet++) {
      const positions = [], colors = [], indices = [];
      for (let ir = 0; ir <= Nr; ir++) {
        for (let ith = 0; ith <= Nth; ith++) {
          const r   = (ir / Nr) * 2.5 + 0.05;
          const th  = (ith / Nth) * 2 * Math.PI;
          const phi = th / 2 + sheet * Math.PI; // sheet 0: [0,π], sheet 1: [π,2π]
          const x   = r * Math.cos(th);
          const z3  = r * Math.sin(th);
          const y   = Math.sqrt(r) * Math.sin(phi);
          positions.push(x, y, z3);
          // 色: シートごとに色相変える、高さで明度
          const hue = sheet === 0 ? 0.55 : 0.02;
          const val = 0.5 + 0.5 * (y / 1.6);
          const [rr,gg,bb] = hsv2rgb(hue, 0.7, Math.max(0.2, Math.min(1, val)));
          colors.push(rr, gg, bb);
        }
      }
      for (let ir = 0; ir < Nr; ir++) for (let ith = 0; ith < Nth; ith++) {
        const a = ir*(Nth+1)+ith, b=a+1, c=a+(Nth+1), d=c+1;
        indices.push(a,c,b, b,c,d);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setAttribute('color',    new THREE.Float32BufferAttribute(colors, 3));
      geo.setIndex(indices);
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
        vertexColors: true, side: THREE.DoubleSide, shininess: 40,
        transparent: true, opacity: 0.88
      }));
      scene.add(m);
      meshes.push(m);
    }
  }

  // log z リーマン面: 無限枚 (2枚を可視化)
  // log(r e^{iθ}) = ln(r) + iθ
  // 各シートk: θ から kπ*2 ずれた高さ
  function buildLog() {
    const Nr = 40, Nth = 100;
    for (let sheet = -1; sheet <= 1; sheet++) {
      const positions = [], colors = [], indices = [];
      for (let ir = 0; ir <= Nr; ir++) {
        for (let ith = 0; ith <= Nth; ith++) {
          const r  = (ir / Nr) * 2.2 + 0.1;
          const th = (ith / Nth) * 2 * Math.PI;
          const x  = r * Math.cos(th);
          const z3 = r * Math.sin(th);
          const y  = (th + sheet * 2 * Math.PI) * 0.35; // Im(log z) = arg(z) + 2πk
          positions.push(x, y, z3);
          const hue = (sheet + 1) / 3;
          const [rr,gg,bb] = hsv2rgb(hue, 0.75, 0.75);
          colors.push(rr, gg, bb);
        }
      }
      for (let ir = 0; ir < Nr; ir++) for (let ith = 0; ith < Nth; ith++) {
        const a = ir*(Nth+1)+ith, b=a+1, c=a+(Nth+1), d=c+1;
        indices.push(a,c,b, b,c,d);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setAttribute('color',    new THREE.Float32BufferAttribute(colors, 3));
      geo.setIndex(indices);
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
        vertexColors: true, side: THREE.DoubleSide, shininess: 40,
        transparent: true, opacity: 0.85
      }));
      scene.add(m);
      meshes.push(m);
    }
  }

  // ∛z リーマン面: 3枚のシート
  function buildCbrt() {
    const Nr = 40, Nth = 120;
    for (let sheet = 0; sheet < 3; sheet++) {
      const positions = [], colors = [], indices = [];
      for (let ir = 0; ir <= Nr; ir++) {
        for (let ith = 0; ith <= Nth; ith++) {
          const r   = (ir / Nr) * 2.5 + 0.05;
          const th  = (ith / Nth) * 2 * Math.PI;
          const phi = th / 3 + sheet * 2 * Math.PI / 3;
          const x   = r * Math.cos(th);
          const z3  = r * Math.sin(th);
          const y   = Math.pow(r, 1/3) * Math.sin(phi);
          positions.push(x, y, z3);
          const hue = sheet / 3;
          const [rr,gg,bb] = hsv2rgb(hue, 0.75, 0.8);
          colors.push(rr, gg, bb);
        }
      }
      for (let ir = 0; ir < Nr; ir++) for (let ith = 0; ith < Nth; ith++) {
        const a = ir*(Nth+1)+ith, b=a+1, c=a+(Nth+1), d=c+1;
        indices.push(a,c,b, b,c,d);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setAttribute('color',    new THREE.Float32BufferAttribute(colors, 3));
      geo.setIndex(indices);
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
        vertexColors: true, side: THREE.DoubleSide, shininess: 40,
        transparent: true, opacity: 0.85
      }));
      scene.add(m);
      meshes.push(m);
    }
  }

  // 分岐点マーカー（原点）
  const branchDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  scene.add(branchDot);

  function rebuild() {
    clearMeshes();
    const f = funcSel.value;
    if (f === 'sqrt')      buildSqrt();
    else if (f === 'log')  buildLog();
    else if (f === 'cbrt') buildCbrt();
    camera.position.set(3, 2.5, 6);
    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);
  }

  funcSel.addEventListener('change', rebuild);
  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    renderer.setSize(w, H);
    camera.aspect = w / H;
    camera.updateProjectionMatrix();
  });

  function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  rebuild();
  animate();
})();
