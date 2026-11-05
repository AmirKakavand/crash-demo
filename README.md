# Crash Game Client Demo

A high-performance, lightweight Crash Game frontend client built to demonstrate iGaming-specific architecture, deterministic network recovery, and strict bundle size management. 

## Core Objectives
1. **Mobile Optimization (<250KB Bundle):** Achieved by bypassing heavy DOM frameworks (React/Vue) in favor of Vanilla TypeScript and utilizing strict bare-module imports for PixiJS to ensure aggressive tree-shaking.
2. **Smooth 60 FPS Rendering:** Utilizes PixiJS's delta-time Ticker and linear interpolation (lerp) to prevent micro-stuttering from 100ms server ticks.
3. **Deterministic State Recovery:** A robust mock WebSocket client featuring exponential backoff for reconnections and absolute state snapshot requests to prevent out-of-sync bugs after network drops.

## Tech Stack
* **Vite** (Build tooling & dead-code elimination)
* **TypeScript** (Strict typing for game states and server contracts)
* **PixiJS v7/v8** (Modular canvas rendering)
* **Vitest** (Unit testing for network reconciliation and recovery loops)

## Project Structure
* `/src/core` - Framework-agnostic game math, state machines, and WebSocket mock.
* `/src/graphics` - PixiJS rendering layer, completely isolated from game logic.
* `/tests` - Vitest suites verifying disconnects, reconnections, and state recovery.

## Getting Started

### Installation
```bash
npm install