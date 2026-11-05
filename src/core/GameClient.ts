import { GameState, ServerMessage, GameEventListener } from './types';

export class GameClient {
    private state: GameState = {
        gameId: 'round-1',
        status: 'WAITING',
        currentMultiplier: 1.0,
        startTime: 0,
    };

    private listeners: Set<GameEventListener> = new Set();
    private isConnected = false;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private timer: ReturnType<typeof setInterval> | null = null;

    // mockServerCrashAt allows us to test different crash scenarios
    constructor(private mockServerCrashAt = 3.5) { }

    public subscribe(listener: GameEventListener): () => void {
        this.listeners.add(listener);
        listener(this.state);
        return () => this.listeners.delete(listener);
    }

    public connect(): void {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.requestStateSnapshot();
        this.startMockSocketServer();
    }

    public disconnect(forceDrop = false): void {
        this.isConnected = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        if (forceDrop) {
            this.handleDrop();
        }
    }

    private handleDrop(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
        const backoff = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 4000);
        this.reconnectAttempts++;
        console.warn(`Connection dropped. Reconnecting in ${backoff}ms...`);

        setTimeout(() => {
            this.connect();
        }, backoff);
    }

    // State Recovery: Ask server for an absolute snapshot upon reconnecting
    private requestStateSnapshot(): void {
        if (!this.isConnected) return;
        this.handleMessage({
            type: 'STATE_SNAPSHOT',
            payload: { ...this.state },
        });
    }

    public handleMessage(msg: ServerMessage): void {
        switch (msg.type) {
            case 'STATE_SNAPSHOT':
                this.state = { ...msg.payload };
                break;
            case 'TICK':
                if (this.state.status === 'RUNNING' && this.state.gameId === msg.payload.gameId) {
                    this.state.currentMultiplier = msg.payload.multiplier;
                }
                break;
            case 'CRASH':
                this.state.status = 'CRASHED';
                this.state.crashMultiplier = msg.payload.finalMultiplier;
                this.state.currentMultiplier = msg.payload.finalMultiplier;
                break;
        }
        this.emit();
    }

    private emit(): void {
        this.listeners.forEach((fn) => fn({ ...this.state }));
    }

    private startMockSocketServer(): void {
        if (this.state.status === 'WAITING') {
            this.state.status = 'RUNNING';
            this.state.startTime = Date.now();
            this.state.currentMultiplier = 1.0;
        }

        // Emulate server sending 100ms ticks
        this.timer = setInterval(() => {
            if (!this.isConnected || this.state.status !== 'RUNNING') return;

            const nextMult = +(this.state.currentMultiplier + 0.04).toFixed(2);
            if (nextMult >= this.mockServerCrashAt) {
                this.handleMessage({
                    type: 'CRASH',
                    payload: { gameId: this.state.gameId, finalMultiplier: nextMult },
                });
                clearInterval(this.timer!);
            } else {
                this.handleMessage({
                    type: 'TICK',
                    payload: { gameId: this.state.gameId, multiplier: nextMult },
                });
            }
        }, 100);
    }

    public getState(): GameState {
        return { ...this.state };
    }

    public getStatus(): boolean {
        return this.isConnected;
    }
}