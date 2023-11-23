import { type Socket, io } from 'socket.io-client';
import { writable } from 'svelte/store';

export const INITIAL_DATA_TOPIC = 'INITIAL_DATA';
export const ADD_ITEM_TOPIC = 'ADD_ITEM';
export const REMOVE_ITEM_TOPIC = 'REMOVE_ITEM';
export const LIST_CHANGES_TOPIC = 'LIST_CHANGES';
export const TOGGLE_PLAY_TOPIC = 'TOGGLE_PLAY';

export type Item = {
	name: string;
	id: number;
};

export type InitialData = {
	participantList: Item[];
	isPlaying: boolean;
};

export type Toggle = 'start' | 'stop';

export const participantList = writable<Item[]>([]);
export const isPlaying = writable<boolean>(false);

export const setupWebSocket = (): Socket => {
	const socket = io();

	socket.on('connect', () => {
		console.log('Socket connected', socket.id);
	});

	// socket.io.on("reconnect_error", (error) => {
	//   console.log('RECCONENCT ERROR', error);
	// });

	// socket.io.on("reconnect_failed", () => {
	//   console.log('RECCONENCT FAILED');
	// });

	socket.on('disconnect', (reason) => {
		console.log('Socket diconnected', socket.id);

		if (reason === 'io server disconnect') {
			console.log('the disconnection was initiated by the server, you need to reconnect manually');
			socket.connect();
		}
		// else the socket will automatically try to reconnect
	});

	socket.on(INITIAL_DATA_TOPIC, (initialData: InitialData) => {
		console.log('GOT INITIAL DATA', initialData);

		participantList.set([...initialData.participantList]);
		isPlaying.set(initialData.isPlaying);
	});

	socket.on(LIST_CHANGES_TOPIC, (changes: Item[]) => {
		participantList.set([...changes]);
	});

	socket.on(TOGGLE_PLAY_TOPIC, (toggle: Toggle) => {
		isPlaying.set(toggle === 'start' ? true : false);
	});

	return socket;
};

// FOR POGRESS and time tracking

// const SESSION_INTERVAL = 10 * 1000;
// const CADENCE = 100;
