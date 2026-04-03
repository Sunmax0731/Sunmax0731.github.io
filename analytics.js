(() => {
  const measurementId =
    typeof window.SUNMAX_ANALYTICS?.googleAnalyticsMeasurementId === "string"
      ? window.SUNMAX_ANALYTICS.googleAnalyticsMeasurementId.trim()
      : "";

  if (!/^G-[A-Z0-9]+$/i.test(measurementId)) {
    window.SunmaxAnalytics = {
      enabled: false,
      trackPageView: () => {},
    };
    return;
  }

  if (window.SunmaxAnalytics?.enabled) {
    return;
  }

  const dataLayer = (window.dataLayer = window.dataLayer || []);
  function gtag() {
    dataLayer.push(arguments);
  }

  window.gtag = window.gtag || gtag;
  const scheduleMicrotask =
    typeof window.queueMicrotask === "function"
      ? window.queueMicrotask.bind(window)
      : (callback) => Promise.resolve().then(callback);

  const currentPath = () => `${window.location.pathname}${window.location.search}`;

  const trackPageView = (path = currentPath(), title = document.title) => {
    const locationUrl = new URL(path, window.location.origin).href;
    window.gtag("event", "page_view", {
      page_title: title,
      page_path: path,
      page_location: locationUrl,
    });
  };

  const injectTagManager = () => {
    if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${measurementId}"]`)) {
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
  };

  const installHistoryTracking = () => {
    let lastPath = currentPath();

    const trackIfChanged = () => {
      const nextPath = currentPath();
      if (nextPath === lastPath) return;
      lastPath = nextPath;
      trackPageView(nextPath);
    };

    const wrapHistoryMethod = (methodName) => {
      const original = window.history[methodName];
      if (typeof original !== "function") return;

      window.history[methodName] = function patchedHistoryMethod(...args) {
        const result = original.apply(this, args);
        scheduleMicrotask(trackIfChanged);
        return result;
      };
    };

    wrapHistoryMethod("pushState");
    wrapHistoryMethod("replaceState");
    window.addEventListener("popstate", trackIfChanged);
  };

  injectTagManager();
  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    page_title: document.title,
    page_path: currentPath(),
  });
  installHistoryTracking();

  window.SunmaxAnalytics = {
    enabled: true,
    measurementId,
    trackPageView,
  };
})();
