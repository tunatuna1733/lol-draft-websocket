import type { CreateRoomMessage } from '../../types/client';
import { generateRandomString } from '../../util';
import type { RoomData } from '../../types/room';
import { rooms } from '../../data';

export const createRoom = (data: CreateRoomMessage) => {
	const id = generateRandomString();
	const roomData: RoomData = {
		id,
		currentPhase: {
			kind: 'Ban',
			team: 'Blue',
			order: 1,
			eta: 0,
			paused: false,
		},
		selectedChamp: '',
		teams: {
			Blue: {
				name: data.team1Name,
				players: [],
				bans: ['', '', '', '', ''],
				isReady: false,
			},
			Red: {
				name: data.team2Name,
				players: [],
				bans: ['', '', '', '', ''],
				isReady: false,
			},
		},
		starting: false,
		started: false,
		ended: false,
		expire: Date.now() + 20 * 60 * 1000,
	};
	rooms.push(roomData);
	console.log(`Created room of id: ${id}`);
	return id;
};
