import { sveltekit } from '@sveltejs/kit/vite';
import { type ViteDevServer, defineConfig } from 'vite';

const webSocketServer = {
	name: 'webSocketServer',
	async configureServer(server: ViteDevServer) {
		const socketServer = await import('./server/app');

		socketServer.setupDevServer(server);
	}
};

export default defineConfig({
	plugins: [sveltekit(), webSocketServer],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
