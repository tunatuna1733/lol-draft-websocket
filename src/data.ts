import type { DraftTimer } from './draft';
import type { RoomData } from './types/room';

export let rooms: RoomData[] = [];

export const timers: { [index in string]: DraftTimer } = {};

setInterval(() => {
	// check for ended and expired rooms
	const endedIDs = Object.values(timers)
		.filter((t) => t.roomData.ended || t.roomData.expire < Date.now())
		.map((t) => t.id);
	rooms = rooms.filter((r) => !endedIDs.includes(r.id));
	for (const endedID of endedIDs) {
		delete timers[endedID];
	}
}, 120 * 1000);
