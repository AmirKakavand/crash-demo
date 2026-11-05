import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        target: 'es2022',
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
        },
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('@pixi')) {
                        return 'pixi';
                    }
                },
            },
        },
    },
});