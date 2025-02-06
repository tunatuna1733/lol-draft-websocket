import type { DraftTimer } from './draft';
import type { RoomData } from './types/room';
import type { TeamCreationData } from './types/team';

export let rooms: RoomData[] = [];
export let teams: TeamCreationData[] = [];

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

	// same for team creation rooms
	teams = teams.filter((t) => Date.now() - t.createdTime < 20 * 60 * 1000);
}, 120 * 1000);

setInterval(() => {}, 30 * 1000);
