import type { ViteDevServer } from 'vite';
import type { createServer } from 'http';
import { Server } from 'socket.io';

type Item = {
	name: string;
	id: number;
};

export const setup = (httpServer: ReturnType<typeof createServer>) => {
	const io = new Server(httpServer);

	let items: Item[] = [
		{
			id: 1,
			name: 'Codrin Mares'
		}
	];

	io.on('connection', (socket) => {
		console.log('Server socket connected');

		console.log('Sending initial data...');
		socket.emit('initial-data', items);

		socket.on('add-item', (newItem: Item) => {
			console.log('New item added', newItem);
			items = [...items, newItem];

			console.log('Broadcasting changes...');
			socket.broadcast.emit('changes', items);
		});

		socket.on('remove-item', (id: number) => {
			console.log('Item removed', id);
			items = items.filter((x) => x.id !== id);

			console.log('Broadcasting changes...');
			socket.broadcast.emit('changes', items);
		});
	});
};

export const setupDevServer = (server: ViteDevServer) => {
	if (!server.httpServer) {
		return;
	}

	setup(server.httpServer);
};
