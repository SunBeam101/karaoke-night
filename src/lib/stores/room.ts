import { writable } from "svelte/store";

export type Room = {
  id: string,
  name: string,
}

export const rooms = writable<Room[]>([]);