import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        host: true,
        historyApiFallback: true,
    },
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, '/index.html'),
                home: resolve(__dirname, '/src/apps/index.html'),
                phone: resolve(__dirname, '/src/apps/phone/index.html'),
                calendar: resolve(__dirname, '/src/apps/calendar/index.html'),
                calculator: resolve(__dirname, '/src/apps/calculator/index.html'),
                clock: resolve(__dirname, '/src/apps/clock/index.html'),
                notes: resolve(__dirname, '/src/apps/notes/index.html'),
                settings: resolve(__dirname, '/src/apps/settings/index.html'),
                weather: resolve(__dirname, '/src/apps/weather/index.html'),
                // maps: resolve(__dirname, '/maps/index.html'),
                // music: resolve(__dirname, '/music/index.html'),
                // journal: resolve(__dirname, '/journal/index.html'),
                // wallet: resolve(__dirname, '/wallet/index.html'),
            },
        },
    },
})