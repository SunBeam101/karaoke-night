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
	participantList: PriorityItem[];
	isPlaying: boolean;
};

export type Toggle = 'start' | 'stop';
