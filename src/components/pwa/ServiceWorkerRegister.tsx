"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // 로컬 개발 중 등록 실패는 치명적이지 않으므로 조용히 무시한다.
      });
    }
  }, []);

  return null;
}
