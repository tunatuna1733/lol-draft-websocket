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
		paused: false,
		starting: false,
		started: false,
	};
	rooms.push(roomData);
	console.log(`Created room of id: ${id}`);
	return id;
};
