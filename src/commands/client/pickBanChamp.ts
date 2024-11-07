import type { ServerWebSocket } from 'bun';
import type { PickBanChampMessage } from '../../types/client';
import { rooms, timers } from '../../data';
import type { ResultMessage } from '../../types/server';

export const pickBanChamp = (ws: ServerWebSocket<unknown>, data: PickBanChampMessage) => {
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
	const response: PickBanChamp = {
		command: 'PickBanChamp',
		team: data.team,
		champ: data.champ,
		order: data.order,
	};
  */
	if (Date.now() - timers[roomData.id].stepStartTime < 2 * 1000) return;
	roomData.teams[data.team].bans[data.order - 1] = data.champ;
	roomData.selectedChamp = '';
	ws.publish(roomData.id, JSON.stringify(roomData));
	ws.send(JSON.stringify(roomData));
	timers[roomData.id].forceNext();
};
