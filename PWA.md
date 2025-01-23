To convert this dictionary app into an installable offline web app (Progressive Web App), follow these steps:

1. **Create a Service Worker** (`sw.js`):
```javascript
const CACHE_NAME = 'dictionary-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/dictionary.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

2. **Create a Web App Manifest** (`manifest.json`):
```json
{
  "name": "English-Somali Dictionary",
  "short_name": "Qaamuuska",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f0f0f0",
  "theme_color": "#4CAF50",
  "icons": [
    {
      "src": "icons/icon-192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "icons/icon-512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ]
}
```

3. **Update your HTML file** (add these inside `<head>`):
```html
<!-- Add manifest -->
<link rel="manifest" href="manifest.json">

<!-- Add iOS meta tags -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="icons/icon-192.png">

<!-- Add theme color -->
<meta name="theme-color" content="#4CAF50">
```

4. **Update your JavaScript** (add service worker registration to `app.js`):
```javascript
// Add at the bottom of app.js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}
```

5. **Create icons**:
- Create an `icons` directory
- Generate 192x192 and 512x512 PNG icons (you can use realfavicongenerator.net)
- Save them as `icon-192.png` and `icon-512.png` in the icons directory

**Final file structure**:
```
your-app/
├── index.html
├── manifest.json
├── sw.js
├── app.js
├── style.css
├── dictionary.json
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

**Key changes made**:
1. Added service worker for offline functionality
2. Added web app manifest for installation
3. Added proper meta tags for iOS support
4. Cached all necessary assets
5. Added proper icons for installation

**To test the PWA**:
1. Serve the app over HTTPS (or localhost)
2. Open Chrome DevTools → Application → Service Workers to verify registration
3. Check the "Offline" checkbox in DevTools to test offline functionality
4. Look for the install prompt in supported browsers

**Features added**:
- Works offline after first visit
- Installable on devices
- Fast loading from cache
- Native app-like experience
- Automatic updates when service worker changes

**Important notes**:
1. The app must be served over HTTPS (or localhost) for PWA features
2. Users will get an install prompt after visiting the site twice
3. The service worker will automatically cache updates when you change the CACHE_NAME
4. Add more icons for better platform support if needed

To deploy:
1. Upload all files to your web server
2. Ensure the server serves the correct MIME types
3. Test using Lighthouse in Chrome DevTools to verify PWA compliance