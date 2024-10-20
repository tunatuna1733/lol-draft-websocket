import type { ServerWebSocket } from 'bun';
import type { SelectChampMessage } from '../../types/client';
import { rooms } from '../../data';
import type { ResultMessage } from '../../types/server';

export const selectChamp = (ws: ServerWebSocket<unknown>, data: SelectChampMessage) => {
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
  const response: SelectChamp = {
		command: 'SelectChamp',
		name: data.name,
		team: data.team,
		champ: data.champ,
		order: data.order,
	};
  */
	roomData.selectedChamp = data.champ;
	ws.publish(roomData.id, JSON.stringify(roomData));
	ws.send(JSON.stringify(roomData));
};
