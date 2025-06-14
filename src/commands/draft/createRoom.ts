import { rooms } from '../../data';
import type { CreateRoomMessage } from '../../types/client';
import type { RoomData } from '../../types/room';
import type { PlayerData } from '../../types/team';
import { generateRandomString } from '../../util';

export const createRoom = (
	data: CreateRoomMessage,
	channelId?: string,
	teamData?: { Blue: PlayerData[]; Red: PlayerData[] } | null,
) => {
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
		expire: Date.now() + 60 * 60 * 1000,
		globalBans: [],
		channelId,
		fearlessId: generateRandomString(),
	};
	rooms.push(roomData);
	return id;
};
