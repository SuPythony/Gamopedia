import { writable } from "svelte/store";

export const app = writable(undefined);
export const auth = writable(undefined);
export const signedIn = writable(undefined);
export const initializing = writable(true);
export const currGame = writable({});
export const currCover = writable({});
export const openedIndex = writable(0);
