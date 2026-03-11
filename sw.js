self.addEventListener('fetch', function(event) {
  // هذا الكود يسمح للتطبيق بالعمل حتى لو انقطع الإنترنت لاحقاً
  event.respondWith(fetch(event.request));
});
