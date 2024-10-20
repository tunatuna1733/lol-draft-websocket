import type { ServerWebSocket } from 'bun';
import type { JoinMessage } from '../../types/client';
import { rooms } from '../../data';
import type { PlayerData } from '../../types/room';
import type { ResultMessage } from '../../types/server';

export const join = (ws: ServerWebSocket<unknown>, data: JoinMessage) => {
	const roomData = rooms.find((r) => r.id === data.roomID);
	if (!roomData) {
		const error: ResultMessage = {
			success: false,
			message: 'Room not found',
		};
		ws.send(JSON.stringify(error));
		return;
	}
	const player: PlayerData = {
		name: data.name,
		team: data.team,
		lane: '',
		champ: '',
		isNPC: false,
	};
	roomData.teams[data.team].players.push(player);
	/*
  const pubMsg: PlayerJoin = {
		command: 'PlayerJoin',
		name: data.name,
		team: data.team,
	};
  */
	ws.send(JSON.stringify(roomData));
	ws.subscribe(roomData.id);
	ws.publish(roomData.id, JSON.stringify(roomData));
	console.log(`Publised player join: ${roomData.id}`);
};
