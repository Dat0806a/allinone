self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Xử lý Push Notification từ Server (khi app đóng)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Đến giờ uống thuốc';
  const options = {
    body: data.body || 'Bạn có lịch uống thuốc ngay bây giờ.',
    icon: '/vite.svg',
    badge: '/vite.svg',
    vibrate: [200, 100, 200, 100, 200, 100, 200],
    data: {
      url: data.url || '/'
    },
    requireInteraction: true,
    actions: [
      { action: 'take', title: 'Đã uống' },
      { action: 'snooze', title: 'Nhắc lại sau 10p' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Xử lý khi user click vào Notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'take') {
    // Xử lý logic đánh dấu đã uống (gửi message về client nếu client đang mở, hoặc gọi API)
    console.log('User clicked "Đã uống"');
  } else if (event.action === 'snooze') {
    console.log('User clicked "Nhắc lại sau 10p"');
  } else {
    // Mở app nếu click vào body
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        const urlToOpen = event.notification.data ? event.notification.data.url : '/';
        
        for (let i = 0; i < clientList.length; i++) {
          let client = clientList[i];
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
    );
  }
});

// Lắng nghe message từ Client (để test notification local)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(event.data.title, event.data.options);
  }
});
