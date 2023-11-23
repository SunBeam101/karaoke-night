import type { ViteDevServer } from 'vite';
import type { createServer } from 'http';
import { Server } from 'socket.io';
import {
	ADD_ITEM_TOPIC,
	LIST_CHANGES_TOPIC,
	type Item,
	REMOVE_ITEM_TOPIC,
	INITIAL_DATA_TOPIC,
	TOGGLE_PLAY_TOPIC,
	type Toggle
} from './helpers.js';

export const setup = (httpServer: ReturnType<typeof createServer>) => {
	const io = new Server(httpServer);

	let participantList: Item[] = [
		{
			id: 1,
			name: 'Codrin Mares'
		},
		{
			id: 2,
			name: 'Codrin Mares 2'
		},
		{
			id: 3,
			name: 'Codrin Mares 3'
		}
	];

	let isPlaying = false;

	io.on('connection', (socket) => {
		console.log('Server socket connected');

		console.log('Sending initial data...');
		socket.emit(INITIAL_DATA_TOPIC, {
			participantList,
			isPlaying
		});

		socket.on(ADD_ITEM_TOPIC, (newItem: Item) => {
			console.log('New item added', newItem);
			participantList = [...participantList, newItem];

			console.log('Broadcasting changes...');
			socket.broadcast.emit(LIST_CHANGES_TOPIC, participantList);
		});

		socket.on(REMOVE_ITEM_TOPIC, (id: number) => {
			console.log('Item removed', id);
			participantList = participantList.filter((x) => x.id !== id);

			console.log('Broadcasting changes...');
			socket.broadcast.emit(LIST_CHANGES_TOPIC, participantList);
		});

		socket.on(TOGGLE_PLAY_TOPIC, (toggle: Toggle) => {
			console.log('Toggle play', toggle);

			isPlaying = toggle === 'start' ? true : false;

			console.log('Broadcasting changes...');
			socket.broadcast.emit(TOGGLE_PLAY_TOPIC, toggle);
		});
	});
};

export const setupDevServer = (server: ViteDevServer) => {
	if (!server.httpServer) {
		return;
	}

	setup(server.httpServer);
};
