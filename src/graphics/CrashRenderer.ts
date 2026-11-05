import { Application } from '@pixi/app';
import { Graphics } from '@pixi/graphics';
import { Text, TextStyle } from '@pixi/text';
import type { GameState } from '../core/types';

export class CrashRenderer {
  private app: Application;
  private curve: Graphics;
  private text: Text;
  private targetMultiplier = 1.0;
  private renderedMultiplier = 1.0;
  private isCrashed = false;

  constructor(container: HTMLElement) {
    this.app = new Application({
      width: 800,
      height: 500,
      backgroundColor: 0x141622,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
      antialias: true,
    });

    container.appendChild(this.app.view as HTMLCanvasElement);

    this.curve = new Graphics();
    this.app.stage.addChild(this.curve);

    const style = new TextStyle({
      fontFamily: 'system-ui, sans-serif',
      fontSize: 64,
      fontWeight: 'bold',
      fill: '#ffffff',
    });
    this.text = new Text('1.00x', style);
    this.text.anchor.set(0.5);
    this.text.position.set(400, 250);
    this.app.stage.addChild(this.text);

    // Attach the update loop to Pixi's native Ticker (60+ FPS)
    this.app.ticker.add(this.update.bind(this));
  }

  public onServerStateChange(state: GameState): void {
    this.targetMultiplier = state.currentMultiplier;
    this.isCrashed = state.status === 'CRASHED';

    if (state.status === 'WAITING') {
      this.targetMultiplier = 1.0;
      this.renderedMultiplier = 1.0;
      this.isCrashed = false;
    }
  }

  private update(delta: number): void {
    // Lerp (Linear Interpolation): Smooths the jump between 100ms server ticks
    this.renderedMultiplier += (this.targetMultiplier - this.renderedMultiplier) * (0.15 * delta);

    if (this.isCrashed) {
      this.text.style.fill = '#ff4d4d'; // Red text on crash
      this.text.text = `CRASHED @ ${this.targetMultiplier.toFixed(2)}x`;
      return;
    }

    this.text.style.fill = '#ffffff';
    this.text.text = `${this.renderedMultiplier.toFixed(2)}x`;

    this.drawCurve(this.renderedMultiplier);
  }

  private drawCurve(multiplier: number): void {
    const g = this.curve;
    g.clear();

    const w = this.app.screen.width;
    const h = this.app.screen.height;
    const startX = 50;
    const startY = h - 50;

    // Map the multiplier to an exponential visual curve
    const progress = Math.min((multiplier - 1) / 4, 1); // Cap visual progression
    const endX = startX + progress * (w - 150);
    const endY = startY - Math.pow(progress, 1.8) * (h - 150);

    // Draw the trajectory line
    g.lineStyle(4, 0x00ff88, 1);
    g.moveTo(startX, startY);
    g.quadraticCurveTo(startX + (endX - startX) * 0.6, startY, endX, endY);

    // Draw the "rocket" dot at the tip
    g.beginFill(0x00ff88);
    g.drawCircle(endX, endY, 8);
    g.endFill();
  }

  public destroy(): void {
    this.app.destroy(true, { children: true, texture: true, baseTexture: true });
  }
}