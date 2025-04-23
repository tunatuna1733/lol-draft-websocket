import type { ServerWebSocket } from 'bun';
import { rooms } from '../../data';
import type { SetGlobalBansMessage } from '../../types/client';
import type { ResultMessage } from '../../types/server';

export const setGlobalBans = (ws: ServerWebSocket<unknown>, data: SetGlobalBansMessage) => {
	const roomData = rooms.find((r) => r.id === data.roomID);
	if (!roomData) {
		const error: ResultMessage = {
			success: false,
			message: 'Room not found',
		};
		ws.send(JSON.stringify(error));
		return;
	}
	roomData.globalBans = data.bans;
	ws.publish(roomData.id, JSON.stringify(roomData));
	ws.send(JSON.stringify(roomData));
};
