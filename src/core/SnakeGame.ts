export type Point = { x: number; y: number };
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export class SnakeGame {
    public snake: Point[] = [];
    public food: Point = { x: 0, y: 0 };
    public direction: Direction = 'RIGHT';
    public nextDirection: Direction = 'RIGHT';
    public gridSize = 20;
    public isGameOver = false;
    public score = 0;

    constructor() {
        this.reset();
    }

    public reset(): void {
        this.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 },
        ];
        this.direction = 'RIGHT';
        this.nextDirection = 'RIGHT';
        this.isGameOver = false;
        this.score = 0;
        this.spawnFood();
    }

    public setDirection(dir: Direction): void {
        const opposites = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
        if (opposites[dir] !== this.direction) {
            this.nextDirection = dir;
        }
    }

    public tick(): void {
        if (this.isGameOver) return;

        this.direction = this.nextDirection;
        const head = { ...this.snake[0] };

        switch (this.direction) {
            case 'UP': head.y -= 1; break;
            case 'DOWN': head.y += 1; break;
            case 'LEFT': head.x -= 1; break;
            case 'RIGHT': head.x += 1; break;
        }

        // Wall Collision
        if (head.x < 0 || head.x >= this.gridSize || head.y < 0 || head.y >= this.gridSize) {
            this.isGameOver = true;
            return;
        }

        // Self Collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.isGameOver = true;
            return;
        }

        this.snake.unshift(head);

        // Food Collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.spawnFood();
        } else {
            this.snake.pop();
        }
    }

    private spawnFood(): void {
        let newFood: Point;
        while (true) {
            newFood = {
                x: Math.floor(Math.random() * this.gridSize),
                y: Math.floor(Math.random() * this.gridSize),
            };
            // Ensure food doesn't spawn inside the snake
            if (!this.snake.some(s => s.x === newFood.x && s.y === newFood.y)) {
                this.food = newFood;
                break;
            }
        }
    }
}