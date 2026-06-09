/* eslint-disable */

import "./src/styles/scss/global.scss";
import "./src/styles/scss/markdown.scss";

export const onServiceWorkerUpdateReady = () => {
  window.location.reload();
};

const THEME_CLASSES = ["dark", "light"];

const syncThemeClass = () => {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  const body = document.body;
  if (!html || !body) return;
  THEME_CLASSES.forEach((cls) => {
    if (body.classList.contains(cls)) {
      if (!html.classList.contains(cls)) html.classList.add(cls);
    } else {
      if (html.classList.contains(cls)) html.classList.remove(cls);
    }
  });
};

const startThemeObserver = () => {
  if (typeof document === "undefined" || !document.body) return;
  syncThemeClass();
  const observer = new MutationObserver(syncThemeClass);
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"],
  });
};

export const onClientEntry = () => {
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", startThemeObserver, {
        once: true,
      });
    } else {
      startThemeObserver();
    }
  }
};

export const onRouteUpdate = () => {
  syncThemeClass();
};
