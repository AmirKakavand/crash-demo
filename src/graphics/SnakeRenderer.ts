import { Application } from '@pixi/app';
import { Graphics } from '@pixi/graphics';
import { Text, TextStyle } from '@pixi/text';
import type { SnakeGame } from '../core/SnakeGame';

export class SnakeRenderer {
  private app: Application;
  private graphics: Graphics;
  private scoreText: Text;
  private statusText: Text;
  private cellSize = 0;
  private boardOffset = { x: 0, y: 0 };
  private time = 0;

  public isConnected = true;
  private game: SnakeGame;

  constructor(container: HTMLElement, game: SnakeGame) {
    this.game = game;
    this.app = new Application({
      resizeTo: window,
      backgroundColor: 0x0f1923,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
      antialias: true,
    });

    container.appendChild(this.app.view as HTMLCanvasElement);

    this.graphics = new Graphics();
    this.app.stage.addChild(this.graphics);

    const baseStyle = new TextStyle({
      fontFamily: 'system-ui, sans-serif',
      fontWeight: 'bold',
      dropShadow: true,
      dropShadowBlur: 10,
    });

    this.scoreText = new Text('SCORE: 0', { ...baseStyle, fontSize: 32, fill: '#ffffff', dropShadowColor: '#00ffaa' });
    this.scoreText.position.set(20, 20);
    this.app.stage.addChild(this.scoreText);

    this.statusText = new Text('', { ...baseStyle, fill: '#ff0055', dropShadowColor: '#ff0055', align: 'center' });
    this.statusText.anchor.set(0.5);
    this.app.stage.addChild(this.statusText);

    this.app.ticker.add(this.render.bind(this));
  }

  private calculateLayout(): void {
    const w = this.app.screen.width;
    const h = this.app.screen.height;

    const minDimension = Math.min(w, h) - 40;
    this.cellSize = minDimension / this.game.gridSize;

    this.boardOffset.x = (w - (this.cellSize * this.game.gridSize)) / 2;
    this.boardOffset.y = (h - (this.cellSize * this.game.gridSize)) / 2 + 30;

    this.statusText.position.set(w / 2, this.boardOffset.y + (this.cellSize * this.game.gridSize) / 2);
  }

  private render(delta: number): void {
    this.time += delta * 0.1;
    this.calculateLayout();

    const w = this.app.screen.width;
    const isMobile = w < 768;
    const boardWidth = this.cellSize * this.game.gridSize;

    const g = this.graphics;
    g.clear();

    g.lineStyle(2, 0xffffff, 0.1);
    g.beginFill(0x14202d);
    g.drawRect(
      this.boardOffset.x,
      this.boardOffset.y,
      boardWidth,
      boardWidth
    );
    g.endFill();

    const pulse = Math.sin(this.time) * 2;
    const foodX = this.boardOffset.x + (this.game.food.x * this.cellSize) + (this.cellSize / 2);
    const foodY = this.boardOffset.y + (this.game.food.y * this.cellSize) + (this.cellSize / 2);

    g.beginFill(0xff0055, 0.3);
    g.drawCircle(foodX, foodY, (this.cellSize / 2) + pulse);
    g.beginFill(0xff0055);
    g.drawCircle(foodX, foodY, this.cellSize / 3);
    g.endFill();

    this.game.snake.forEach((segment, index) => {
      const x = this.boardOffset.x + (segment.x * this.cellSize);
      const y = this.boardOffset.y + (segment.y * this.cellSize);
      const padding = 2;

      g.beginFill(index === 0 ? 0x00ffaa : 0x00cc88);
      g.drawRoundedRect(x + padding, y + padding, this.cellSize - (padding * 2), this.cellSize - (padding * 2), 6);
      g.endFill();
    });

    this.statusText.visible = false;
    // Reset scale prior to calculating new bounds
    this.statusText.scale.set(1);

    if (!this.isConnected) {
      this.statusText.style.fontSize = isMobile ? 26 : 40;
      this.statusText.text = 'NETWORK DROPPED\nReconnecting...';
      this.statusText.visible = true;
      this.scoreText.style.fill = '#888888';
      this.scoreText.style.dropShadowColor = '#000000';
      g.beginFill(0x000000, 0.6);
      g.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
      g.endFill();
    } else if (this.game.isGameOver) {
      this.statusText.style.fontSize = isMobile ? 24 : 38;
      const restartMsg = isMobile ? 'Tap anywhere to restart' : 'Press Space to restart';
      this.statusText.text = `GAME OVER\nSCORE: ${this.game.score}\n${restartMsg}`;
      this.statusText.visible = true;
      this.scoreText.style.fill = '#ff0055';
      this.scoreText.style.dropShadowColor = '#ff0055';
    } else {
      this.scoreText.text = `SCORE: ${this.game.score}`;
      this.scoreText.style.fill = '#ffffff';
      this.scoreText.style.dropShadowColor = '#00ffaa';
    }

    // Auto-fit: Ensure text never exceeds 90% of the game board's width
    const maxAllowedWidth = boardWidth * 0.9;
    if (this.statusText.visible && this.statusText.width > maxAllowedWidth) {
      const fitRatio = maxAllowedWidth / this.statusText.width;
      this.statusText.scale.set(fitRatio);
    }
  }
}