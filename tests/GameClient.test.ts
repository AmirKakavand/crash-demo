import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameClient } from '../src/core/GameClient';

describe('GameClient Reconnection & State Recovery', () => {
    let client: GameClient;

    beforeEach(() => {
        // Take control of setTimeout/setInterval
        vi.useFakeTimers();
        client = new GameClient(5.0);
    });

    it('initializes to WAITING and transitions to RUNNING on connect', () => {
        expect(client.getState().status).toBe('WAITING');
        client.connect();
        expect(client.getState().status).toBe('RUNNING');
        expect(client.getStatus()).toBe(true);
        client.disconnect();
    });

    it('recovers state correctly after an unannounced network disconnect', () => {
        client.connect();

        // Simulate server tick progress
        client.handleMessage({
            type: 'TICK',
            payload: { gameId: 'round-1', multiplier: 2.14 },
        });
        expect(client.getState().currentMultiplier).toBe(2.14);

        // Drop connection manually
        client.disconnect(true);
        expect(client.getStatus()).toBe(false);

        // Fast-forward backoff timer by 1000ms (first backoff tier)
        vi.advanceTimersByTime(1000);

        // Client should have auto-reconnected
        expect(client.getStatus()).toBe(true);

        // Verify recovery preserves the last valid state snapshot
        expect(client.getState().currentMultiplier).toBe(2.14);
        client.disconnect();
    });

    it('freezes multiplier upon receiving CRASH message during reconnection phase', () => {
        client.connect();
        client.disconnect(true);

        // Simulated packet arriving right as socket recovers
        client.handleMessage({
            type: 'CRASH',
            payload: { gameId: 'round-1', finalMultiplier: 3.42 },
        });

        expect(client.getState().status).toBe('CRASHED');
        expect(client.getState().currentMultiplier).toBe(3.42);
        expect(client.getState().crashMultiplier).toBe(3.42);
        client.disconnect();
    });
});