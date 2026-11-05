import { SnakeGame } from './core/SnakeGame';
import { SnakeRenderer } from './graphics/SnakeRenderer';
import './style.css';

const appContainer = document.createElement('div');
appContainer.style.width = '100vw';
appContainer.style.height = '100vh';
appContainer.style.overflow = 'hidden';
appContainer.style.position = 'relative';
document.body.appendChild(appContainer);

const game = new SnakeGame();
const renderer = new SnakeRenderer(appContainer, game);

let isConnected = true;
let reconnectAttempts = 0;
let hasAutoDropped = false;

function dropConnection() {
    if (!isConnected) return;

    // If triggered manually, cancel the auto-drop sequence
    hasAutoDropped = true;
    autoDropToast.style.display = 'none';

    isConnected = false;
    renderer.isConnected = false;

    const backoff = Math.min(1000 * Math.pow(2, reconnectAttempts), 4000);
    reconnectAttempts++;

    setTimeout(() => {
        isConnected = true;
        renderer.isConnected = true;
        reconnectAttempts = 0;
    }, backoff);
}

// Snake speed
setInterval(() => {
    if (isConnected) game.tick();
}, 125);

// --- Auto-Drop Countdown UI ---
const autoDropToast = document.createElement('div');
autoDropToast.style.position = 'absolute';
autoDropToast.style.top = '25px';
autoDropToast.style.left = '50%';
autoDropToast.style.transform = 'translateX(-50%)';
autoDropToast.style.background = 'rgba(255, 0, 85, 0.9)';
autoDropToast.style.color = '#fff';
autoDropToast.style.padding = '8px 16px';
autoDropToast.style.borderRadius = '20px';
autoDropToast.style.fontFamily = 'system-ui, sans-serif';
autoDropToast.style.fontSize = 'clamp(12px, 3vw, 16px)'; // Automatically scales on mobile
autoDropToast.style.fontWeight = 'bold';
autoDropToast.style.zIndex = '20';
autoDropToast.style.display = 'none';
autoDropToast.style.pointerEvents = 'none';
autoDropToast.style.whiteSpace = 'nowrap';
autoDropToast.style.boxShadow = '0 4px 12px rgba(255, 0, 85, 0.4)';
appContainer.appendChild(autoDropToast);

let countdown = 3;
const countdownInterval = setInterval(() => {
    if (hasAutoDropped) {
        clearInterval(countdownInterval);
        return;
    }

    // Pause countdown if they are dead or already disconnected
    if (!isConnected || game.isGameOver) {
        autoDropToast.style.display = 'none';
        return;
    }

    if (countdown > 0) {
        autoDropToast.style.display = 'block';
        autoDropToast.innerText = `Simulated network interruption in ${countdown}s...`;
        countdown--;
    } else {
        autoDropToast.style.display = 'none';
        hasAutoDropped = true;
        clearInterval(countdownInterval);
        dropConnection();
    }
}, 1000);

// --- Presentation Layer UI ---
const uiContainer = document.createElement('div');
uiContainer.style.position = 'absolute';
uiContainer.style.top = '15px';
uiContainer.style.right = '15px';
uiContainer.style.display = 'flex';
uiContainer.style.flexDirection = 'column';
uiContainer.style.alignItems = 'flex-end';
uiContainer.style.gap = '10px';
uiContainer.style.zIndex = '10';
appContainer.appendChild(uiContainer);

let infoOpen = window.innerWidth > 768;

const toggleBtn = document.createElement('button');
toggleBtn.innerText = infoOpen ? 'Hide Demo Info' : 'Show Demo Info';
toggleBtn.style.padding = '8px 12px';
toggleBtn.style.background = '#00ffaa';
toggleBtn.style.color = '#000';
toggleBtn.style.border = 'none';
toggleBtn.style.borderRadius = '4px';
toggleBtn.style.fontWeight = 'bold';
toggleBtn.style.cursor = 'pointer';
toggleBtn.style.fontFamily = 'system-ui, sans-serif';
uiContainer.appendChild(toggleBtn);

const infoPanel = document.createElement('div');
infoPanel.style.display = infoOpen ? 'block' : 'none';
infoPanel.style.background = 'rgba(20, 32, 45, 0.85)';
infoPanel.style.border = '1px solid #00ffaa';
infoPanel.style.borderRadius = '8px';
infoPanel.style.padding = '15px';
infoPanel.style.color = '#fff';
infoPanel.style.fontFamily = 'system-ui, sans-serif';
infoPanel.style.maxWidth = '300px';
infoPanel.style.backdropFilter = 'blur(4px)';

infoPanel.innerHTML = `
  <h3 style="margin: 0 0 10px 0; color: #00ffaa; font-size: 16px;">iGaming Architecture Demo</h3>
  <p style="margin: 0 0 10px 0; font-size: 12px; line-height: 1.4; color: #ccc;">
    This interactive demo proves capability in strict performance constraints without framework overhead (React/Vue).
  </p>
  <ul style="margin: 0 0 15px 0; padding-left: 20px; font-size: 12px; color: #eee;">
    <li><strong>Graphics:</strong> PixiJS 60 FPS (Math-only)</li>
    <li><strong>Bundle:</strong> <250KB (Tree-shaken Vite)</li>
    <li><strong>Network:</strong> State Recovery Simulation</li>
  </ul>
`;

const disconnectBtn = document.createElement('button');
disconnectBtn.innerText = 'Simulate Network Drop';
disconnectBtn.style.width = '100%';
disconnectBtn.style.padding = '10px';
disconnectBtn.style.background = '#ff0055';
disconnectBtn.style.color = '#fff';
disconnectBtn.style.border = 'none';
disconnectBtn.style.borderRadius = '4px';
disconnectBtn.style.fontWeight = 'bold';
disconnectBtn.style.cursor = 'pointer';
disconnectBtn.onclick = dropConnection;

infoPanel.appendChild(disconnectBtn);
uiContainer.appendChild(infoPanel);

toggleBtn.onclick = () => {
    infoOpen = !infoOpen;
    infoPanel.style.display = infoOpen ? 'block' : 'none';
    toggleBtn.innerText = infoOpen ? 'Hide Demo Info' : 'Show Demo Info';
};

function closePopupOnOutsideInteraction(e: Event) {
    if (!infoOpen) return;
    if (e.type === 'pointerdown' && uiContainer.contains(e.target as Node)) return;
    infoOpen = false;
    infoPanel.style.display = 'none';
    toggleBtn.innerText = 'Show Demo Info';
}

window.addEventListener('pointerdown', closePopupOnOutsideInteraction);
window.addEventListener('keydown', closePopupOnOutsideInteraction);

// --- Input Handling ---
window.addEventListener('keydown', (e) => {
    if (!isConnected) return;
    if (game.isGameOver) {
        game.reset();
        return;
    }
    switch (e.key) {
        case 'ArrowUp': case 'w': game.setDirection('UP'); break;
        case 'ArrowDown': case 's': game.setDirection('DOWN'); break;
        case 'ArrowLeft': case 'a': game.setDirection('LEFT'); break;
        case 'ArrowRight': case 'd': game.setDirection('RIGHT'); break;
    }
});

let touchStartX = 0;
let touchStartY = 0;

window.addEventListener('touchstart', (e) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    if (!isConnected) return;
    if (game.isGameOver) {
        game.reset();
        return;
    }
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

window.addEventListener('touchend', (e) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    if (!isConnected || game.isGameOver) return;

    const dx = e.changedTouches[0].screenX - touchStartX;
    const dy = e.changedTouches[0].screenY - touchStartY;

    if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;

    if (Math.abs(dx) > Math.abs(dy)) {
        game.setDirection(dx > 0 ? 'RIGHT' : 'LEFT');
    } else {
        game.setDirection(dy > 0 ? 'DOWN' : 'UP');
    }
}, { passive: true });