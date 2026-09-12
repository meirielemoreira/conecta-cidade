self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
  // Mantém o Service Worker ativo sem alterar
  // a forma como o site busca seus dados e imagens.
});