import type { ServerWebSocket } from 'bun';
import type { SwapPlayersMessage } from '../../types/client';
import { rooms } from '../../data';
import type { ResultMessage } from '../../types/server';

export const swapPlayers = (ws: ServerWebSocket<unknown>, data: SwapPlayersMessage) => {
	if (data.index1 > 5 || data.index2 > 5) {
		const error: ResultMessage = {
			success: false,
			message: 'Index out of bounds',
		};
		ws.send(JSON.stringify(error));
		return;
	}
	const roomData = rooms.find((r) => r.id === data.roomID);
	if (!roomData) {
		const error: ResultMessage = {
			success: false,
			message: 'Room not found',
		};
		ws.send(JSON.stringify(error));
		return;
	}
	const newPlayers = [...roomData.teams[data.team].players];
	[newPlayers[data.index1], newPlayers[data.index2]] = [
		roomData.teams[data.team].players[data.index1],
		roomData.teams[data.team].players[data.index2],
	];
	roomData.teams[data.team].players = newPlayers;
	ws.publish(roomData.id, JSON.stringify(roomData));
	ws.send(JSON.stringify(roomData));
};
