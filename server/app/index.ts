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
	type Toggle,
	type PriorityItem
} from './helpers.js';
import { priorityQueue, type PriorityQueue } from './PriorityQueue.js';

const DELETE_ROOM_DATA_TIMEOUT = 60 * 1000;

const participantList: Map<string, PriorityQueue> = new Map();

const getRoomQueue = (roomId: string): PriorityQueue => {
	let queue = participantList.get(roomId);

	if (!queue) {
		queue = priorityQueue();
		participantList.set(roomId, queue);
	}

	return queue;
};

const getRoomData = (roomId: string): PriorityItem[] => {
	return getRoomQueue(roomId).list();
};

const deleteTimeoutIds: Map<string, NodeJS.Timeout> = new Map();

export const setup = (httpServer: ReturnType<typeof createServer>) => {
	const io = new Server(httpServer);

	let isPlaying = false;

	io.on('connection', async (socket) => {
		let currentRoomId = '';

		console.log('Server socket connected');
		const sockets = await io.fetchSockets();
		console.log('Current clients', sockets.length);

		socket.on('join', (roomId: string) => {
			socket.join(roomId);
			currentRoomId = roomId;

			const roomDeleteTimeout = deleteTimeoutIds.get(currentRoomId);

			if (roomDeleteTimeout) {
				console.log(`Found delete timeout for room ${currentRoomId}. Clearing timeout...`);
				clearTimeout(roomDeleteTimeout);
			}

			console.log('Sending initial data...');
			console.log(`For Room id = ${roomId}`, getRoomData(roomId));

			socket.emit(INITIAL_DATA_TOPIC, {
				participantList: getRoomData(roomId),
				isPlaying
			});
		});

		socket.on(ADD_ITEM_TOPIC, (newItem: Item) => {
			console.log('New item added', newItem);

			getRoomQueue(currentRoomId).insert(newItem);

			console.log('Broadcasting changes...');
			socket.to(currentRoomId).emit(LIST_CHANGES_TOPIC, getRoomData(currentRoomId));
		});

		socket.on(REMOVE_ITEM_TOPIC, (id: string) => {
			console.log('Item removed', id);

			getRoomQueue(currentRoomId).remove(id);

			console.log('Broadcasting changes...', getRoomData(currentRoomId));
			socket.broadcast.emit(LIST_CHANGES_TOPIC, getRoomData(currentRoomId));
		});

		socket.on(TOGGLE_PLAY_TOPIC, (toggle: Toggle) => {
			console.log('Toggle play', toggle);

			isPlaying = toggle === 'start' ? true : false;

			console.log('Broadcasting changes...');
			socket.broadcast.emit(TOGGLE_PLAY_TOPIC, toggle);
		});

		socket.on('disconnect', async () => {
			const sockets = await io.in(currentRoomId).fetchSockets();

			console.log(`Client disconnected`);
			console.log(`Remaining clients in room ${currentRoomId} = ${sockets.length}`);
			console.log(`Map of data`, participantList);

			if (sockets.length === 0) {
				console.log(`No more clients in room ${currentRoomId}...`);
				console.log(`Setting timeout of ${DELETE_ROOM_DATA_TIMEOUT}ms to delete data in room...`);
				deleteTimeoutIds.set(
					currentRoomId,
					setTimeout(() => {
						participantList.delete(currentRoomId);
						deleteTimeoutIds.delete(currentRoomId);
						console.log(`Data in room ${currentRoomId} deleted.`);
					}, DELETE_ROOM_DATA_TIMEOUT)
				);
			}
		});
	});
};

export const setupDevServer = (server: ViteDevServer) => {
	if (!server.httpServer) {
		return;
	}

	setup(server.httpServer);
};
