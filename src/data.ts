import { server } from '.';
import type { DraftTimer } from './draft';
import type { Fearless } from './types/db';
import type { RoomData } from './types/room';
import type { TeamCreationData } from './types/team';

export let rooms: RoomData[] = [];
export let teams: TeamCreationData[] = [];
export let fearlessRecords: Fearless[] = [];

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
	teams = teams.filter((t) => Date.now() - t.createdTime < 60 * 60 * 1000);

	// this is for fearless records
	// currently for 10 days
	fearlessRecords = fearlessRecords.filter((r) => Date.now() - r.created < 60 * 60 * 24 * 10 * 1000);
}, 120 * 1000);

// send keep alive messages
setInterval(() => {
	for (const timer of Object.values(timers)) {
		timer.broadcast('KeepAlive');
	}
	for (const team of teams) {
		server.publish(`team-${team.id}`, 'KeepAlive');
	}
}, 30 * 1000);
