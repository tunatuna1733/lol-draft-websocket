import type { CreateRoomMessage } from '../../types/client';
import { generateRandomString } from '../../util';
import type { RoomData } from '../../types/room';
import { rooms } from '../../data';
import type { PlayerData } from '../../types/team';

export const createRoom = (data: CreateRoomMessage, teamData?: { Blue: PlayerData[]; Red: PlayerData[] } | null) => {
	const id = generateRandomString();
	const roomData: RoomData = {
		id,
		currentPhase: {
			kind: 'Ban',
			team: 'Blue',
			order: 1,
			eta: 0,
			remainingTime: 0,
			paused: false,
		},
		selectedChamp: '',
		teams: {
			Blue: {
				name: data.team1Name,
				players: teamData
					? teamData.Blue.map((b) => ({
							name: b.name,
							team: 'Blue',
							lane: b.lane,
							champ: '',
							isBeginner: b.beginner,
							isNPC: false,
						}))
					: [],
				bans: ['', '', '', '', ''],
				isReady: false,
			},
			Red: {
				name: data.team2Name,
				players: teamData
					? teamData.Red.map((r) => ({
							name: r.name,
							team: 'Red',
							lane: r.lane,
							champ: '',
							isBeginner: r.beginner,
							isNPC: false,
						}))
					: [],
				bans: ['', '', '', '', ''],
				isReady: false,
			},
		},
		starting: false,
		started: false,
		ended: false,
		imageSent: false,
		expire: Date.now() + 20 * 60 * 1000,
	};
	rooms.push(roomData);
	return id;
};
