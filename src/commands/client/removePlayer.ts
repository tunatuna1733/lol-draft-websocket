import type { ServerWebSocket } from 'bun';
import type { RemovePlayerMessage } from '../../types/client';
import { rooms } from '../../data';
import type { ResultMessage } from '../../types/server';

export const removePlayer = (ws: ServerWebSocket<unknown>, data: RemovePlayerMessage) => {
	const roomData = rooms.find((r) => r.id === data.roomID);
	if (!roomData) {
		const error: ResultMessage = {
			success: false,
			message: 'Room not found',
		};
		ws.send(JSON.stringify(error));
		return;
	}
	/*
  const response: PickLane = {
		command: 'PickLane',
		name: data.name,
		team: data.team,
		lane: data.lane,
	};
  */
	const player = roomData.teams[data.team].players.filter((p) => p.name !== data.name);
	if (!player) {
		const error: ResultMessage = {
			success: false,
			message: 'Player not found',
		};
		ws.send(JSON.stringify(error));
		return;
	}
	ws.publish(roomData.id, JSON.stringify(roomData));
	ws.send(JSON.stringify(roomData));
};
