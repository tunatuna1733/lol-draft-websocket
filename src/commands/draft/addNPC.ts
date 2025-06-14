import type { ServerWebSocket } from 'bun';
import { rooms } from '../../data';
import type { AddNPCMessage } from '../../types/client';
import type { DraftPlayerData } from '../../types/room';
import type { ResultMessage } from '../../types/server';

export const addNPC = (ws: ServerWebSocket<unknown>, data: AddNPCMessage) => {
	const roomData = rooms.find((r) => r.id === data.roomID);
	if (!roomData) {
		const error: ResultMessage = {
			success: false,
			message: 'Room not found',
		};
		ws.send(JSON.stringify(error));
		return;
	}
	const player: DraftPlayerData = {
		name: data.name,
		team: data.team,
		lane: '',
		champ: '',
		isNPC: true,
		isBeginner: false,
	};
	if (roomData.teams[data.team].players.length < 5) {
		roomData.teams[data.team].players.push(player);
	}
	ws.send(JSON.stringify(roomData));
	ws.publish(roomData.id, JSON.stringify(roomData));
};
