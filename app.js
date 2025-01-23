let dictionaryData = [];
let deferredPrompt; // For PWA installation

// Initialize app
window.addEventListener('DOMContentLoaded', () => {
  initServiceWorker();
  initSearch();
  initInstallPrompt();
});

// Service Worker Registration
function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
        
        // Check for updates every hour
        setInterval(() => registration.update(), 3600000);
        
        // Check if content is cached
        if (registration.active) checkCachedContent();
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  }
}

// Search Functionality
function initSearch() {
  document.getElementById('searchButton').addEventListener('click', searchWord);
  document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchWord();
  });
}

// PWA Installation Handling
function initInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
  });

  window.addEventListener('appinstalled', () => {
    console.log('App installed successfully');
    hideInstallButton();
    deferredPrompt = null;
  });
}

function showInstallButton() {
  const installBtn = document.createElement('button');
  installBtn.id = 'installBtn';
  installBtn.innerHTML = `
    <svg style="width:20px;height:20px;margin-right:8px" viewBox="0 0 24 24">
      <path fill="currentColor" d="M12,2L4,5V6H20V5M15.35,8L15,7H13L12.65,8H9.24L10.24,18H13.58L14.58,8H15.35M14.4,21H9.6L8.6,19H15.4L14.4,21M16,9H14.85L14.15,19H15.9L16,9M3.46,12.88L4.61,11.73L6.38,13.5L9.21,10.67L10.36,11.82L6.38,15.8L3.46,12.88M3.46,17.88L4.61,16.73L6.38,18.5L9.21,15.67L10.36,16.82L6.38,20.8L3.46,17.88Z"/>
    </svg>
    Install App
  `;
  
  Object.assign(installBtn.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '12px 24px',
    background: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '30px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: '1000'
  });

  installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('User response:', outcome);
      if (outcome === 'accepted') hideInstallButton();
    }
  });

  document.body.appendChild(installBtn);
}

function hideInstallButton() {
  const btn = document.getElementById('installBtn');
  if (btn) btn.remove();
}

// Data Handling
async function loadDictionary() {
  try {
    const response = await fetch('/dictionary.json');
    dictionaryData = await response.json();
    console.log('Dictionary data loaded:', dictionaryData.length, 'entries');
  } catch (error) {
    console.error('Error loading dictionary:', error);
    showError('Failed to load dictionary data');
  }
}

// Search Functionality
async function searchWord() {
  const searchTerm = document.getElementById('searchInput').value
    .trim()
    .toLowerCase();
  
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';

  if (!searchTerm) {
    showError('Please enter a word to search');
    return;
  }

  if (!dictionaryData.length) await loadDictionary();

  const matches = dictionaryData.filter(entry => 
    entry.english.toLowerCase() === searchTerm
  );

  if (matches.length === 0) {
    showError('Ereygan kuma jiro');
    return;
  }

  displayResults(matches);
}

function displayResults(matches) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = matches.map(entry => `
    <div class="result">
      <h3>${entry.english}</h3>
      <p><strong>Maaddada:</strong> ${entry.maaddada}</p>
      <p><strong>Soomaali:</strong> ${entry.soomaali}</p>
    </div>
  `).join('');
}

function showError(message) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = `<div class="no-results">${message}</div>`;
}

// Offline Check
function checkCachedContent() {
  caches.match('/dictionary.json')
    .then(response => {
      if (response) {
        console.log('Using cached dictionary data');
        return response.json();
      }
    })
    .then(data => {
      if (data) dictionaryData = data;
    })
    .catch(error => {
      console.log('Cache check error:', error);
    });
}

// Initialize dictionary data
loadDictionary();

// Detect standalone mode
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('Running in standalone mode');
  document.documentElement.classList.add('standalone-mode');
}