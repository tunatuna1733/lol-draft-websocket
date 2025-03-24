import type { ServerWebSocket } from 'bun';
import { rooms } from '../../data';
import type { ReadyMessage } from '../../types/client';
import type { ResultMessage } from '../../types/server';

export const ready = (ws: ServerWebSocket<unknown>, data: ReadyMessage) => {
	const roomData = rooms.find((r) => r.id === data.roomID);
	if (!roomData) {
		const error: ResultMessage = {
			success: false,
			message: 'Room not found',
		};
		ws.send(JSON.stringify(error));
		return;
	}
	roomData.teams[data.team].isReady = data.isReady;
	ws.publish(roomData.id, JSON.stringify(roomData));
	ws.send(JSON.stringify(roomData));
};
