/**
 * Ellen Soul service worker — Phase M12.
 *
 * Scope: minimal. We do NOT cache the app shell here (Next handles its own
 * static caching, and offline-first would clash with the auth/RLS flows).
 * The only reason this SW exists is to host the `push` and
 * `notificationclick` event handlers — without a registered SW the browser
 * cannot deliver Web Push notifications.
 */

self.addEventListener("install", () => {
  // Activate immediately on first install — no waiting on old SW.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Take control of any open clients right away.
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; }
  catch { data = { title: "Ellen Soul", body: event.data ? event.data.text() : "" }; }

  const title = data.title || "Ellen Soul";
  const options = {
    body:    data.body  || "",
    icon:    data.icon  || "/favicon.ico",
    badge:   data.badge || "/favicon.ico",
    tag:     data.tag   || "ellen-soul",   // collapse duplicates on the same kind
    data:    { url: data.url || "/uk/studio" },
    requireInteraction: false,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/uk/studio";
  event.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    // If we already have a tab open on the same origin, focus it and navigate.
    for (const client of list) {
      if ("focus" in client) {
        await client.focus();
        if ("navigate" in client) { try { await client.navigate(url); } catch { /* same-origin only */ } }
        return;
      }
    }
    if (self.clients.openWindow) await self.clients.openWindow(url);
  })());
});
