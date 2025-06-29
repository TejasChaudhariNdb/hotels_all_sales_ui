// Handle push event
self.__WB_MANIFEST;

self.addEventListener("push", function (event) {
    const data = event.data?.json() || {};
  
    const title = data.title || "New Notification";
    const options = {
      body: data.body || "You have a new message.",
      icon: "/logo.png",
      data: {
        url: data.url || "/user", // ✅ this will open when clicked
      },
    };
  
    event.waitUntil(self.registration.showNotification(title, options));
  });
  
  self.addEventListener("notificationclick", function (event) {
    event.notification.close();
    const urlToOpen = event.notification.data?.url || "/";
  
    event.waitUntil(
      clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
        // Focus if already open
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && "focus" in client) {
            return client.focus();
          }
        }
        // Else, open new tab
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  });
  

  self.addEventListener('install', (event) => {
    // self.skipWaiting();
  });
  
  self.addEventListener('activate', (event) => {
    // clients.claim();
  });
  