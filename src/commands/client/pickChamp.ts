import type { ServerWebSocket } from 'bun';
import type { PickChampMessage } from '../../types/client';
import { rooms, timers } from '../../data';
import type { ResultMessage } from '../../types/server';

export const pickChamp = (ws: ServerWebSocket<unknown>, data: PickChampMessage) => {
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
	const response: PickChamp = {
		command: 'PickChamp',
		name: data.name,
		team: data.team,
		champ: data.champ,
		order: data.order,
	};
  */
	timers[roomData.id].pickSelectedChamp();
	roomData.selectedChamp = '';
	ws.publish(roomData.id, JSON.stringify(roomData));
	ws.send(JSON.stringify(roomData));
	timers[roomData.id].forceNext();
};
