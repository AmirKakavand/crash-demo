import { GameClient } from './core/GameClient';
import { CrashRenderer } from './graphics/CrashRenderer';
import './style.css';

// 1. Create a container for the game
const appContainer = document.createElement('div');
appContainer.style.display = 'flex';
appContainer.style.justifyContent = 'center';
appContainer.style.alignItems = 'center';
appContainer.style.height = '100vh';
document.body.appendChild(appContainer);

// 2. Initialize Game Engine and Renderer
const client = new GameClient(4.5); // Game will crash at 4.5x
const renderer = new CrashRenderer(appContainer);

// 3. Bind the network state directly to the renderer
client.subscribe((state) => {
    renderer.onServerStateChange(state);
});

// 4. Start the game loop
client.connect();

// 5. Add a debug button to test the network drop recovery
const btn = document.createElement('button');
btn.innerText = 'Simulate Network Drop';
btn.style.position = 'absolute';
btn.style.top = '20px';
btn.style.left = '20px';
btn.style.padding = '10px 15px';
btn.style.cursor = 'pointer';
btn.style.background = '#ff4d4d';
btn.style.color = '#fff';
btn.style.border = 'none';
btn.style.borderRadius = '4px';

btn.onclick = () => {
    console.log('Manually dropping connection...');
    client.disconnect(true);
};

document.body.appendChild(btn);