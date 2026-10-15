// 탄생 마켓플레이스 서비스 워커 — 최소 구성
// 로그인/주문/결제/관리자 등 개인화·동적 데이터는 절대 캐시하지 않는다(문서 15.1).
// 오직 "페이지 이동(navigation) 요청이 네트워크 실패했을 때의 오프라인 폴백"만 담당한다.

const OFFLINE_CACHE = "tansaeng-offline-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(OFFLINE_CACHE).then((cache) => cache.add(OFFLINE_URL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") {
    return; // API/정적 자산/이미지 등은 전부 네트워크로 그대로 통과시킨다(캐시하지 않음).
  }

  event.respondWith(
    fetch(event.request).catch(() =>
      caches.open(OFFLINE_CACHE).then((cache) => cache.match(OFFLINE_URL))
    )
  );
});
