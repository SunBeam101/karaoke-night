import { priorityQueue, type PriorityQueue } from '$lib/helpers/PriorityQueue';
import { type Socket, io } from 'socket.io-client';
import { derived, writable } from 'svelte/store';

export const INITIAL_DATA_TOPIC = 'INITIAL_DATA';
export const ADD_ITEM_TOPIC = 'ADD_ITEM';
export const REMOVE_ITEM_TOPIC = 'REMOVE_ITEM';
export const LIST_CHANGES_TOPIC = 'LIST_CHANGES';
export const HISTORY_CHANGES_TOPIC = 'HISTORY_CHANGES';
export const TOGGLE_PLAY_TOPIC = 'TOGGLE_PLAY';

export type Item = {
	id: string;
	userName: string;
	songName: string;
	songUrl?: string;
};

export type PriorityItem = [number, Item];

export type InitialData = {
	ongoingParticipants: PriorityItem[];
	participantsHistory: Item[];
	isPlaying: boolean;
};

export type Toggle = 'start' | 'stop';

export const ongoingParticipantsQueue = writable<PriorityQueue>(priorityQueue());
export const ongoingParticipants = derived(
	ongoingParticipantsQueue,
	($participantsQueue) => $participantsQueue.list().map(([_, item]) => item) // eslint-disable-line @typescript-eslint/no-unused-vars
);
export const participantsHistory = writable<Item[]>([]);
export const isPlaying = writable<boolean>(false);
export const isLoading = writable<boolean>(true);

export const setupWebSocket = (roomId: string): Socket => {
	const socket = io();

	socket.on('connect', () => {
		console.log('Socket connected', socket.id);
		socket.emit('join', roomId);
	});

	socket.on('disconnect', (reason) => {
		console.log('Socket diconnected', socket.id);

		if (reason === 'io server disconnect') {
			console.log('the disconnection was initiated by the server, you need to reconnect manually');
			socket.connect();
		}
		// else the socket will automatically try to reconnect
	});

	socket.on(INITIAL_DATA_TOPIC, (initialData: InitialData) => {
		ongoingParticipantsQueue.update((prev) => prev.copy(initialData.ongoingParticipants));
		participantsHistory.set(initialData.participantsHistory);
		isPlaying.set(initialData.isPlaying);
		isLoading.set(false);
	});

	socket.on(LIST_CHANGES_TOPIC, (changes: PriorityItem[]) => {
		ongoingParticipantsQueue.update((prev) => prev.copy(changes));
	});

	socket.on(HISTORY_CHANGES_TOPIC, (changes: Item[]) => {
		participantsHistory.set(changes);
	});

	socket.on(TOGGLE_PLAY_TOPIC, (toggle: Toggle) => {
		isPlaying.set(toggle === 'start' ? true : false);
	});

	return socket;
};

// FOR POGRESS and time tracking

// const SESSION_INTERVAL = 10 * 1000;
// const CADENCE = 100;
