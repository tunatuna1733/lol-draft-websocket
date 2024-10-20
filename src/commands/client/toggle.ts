import type { ServerWebSocket } from 'bun';
import type { ToggleMessage } from '../../types/client';
import { rooms, timers } from '../../data';
import type { ResultMessage } from '../../types/server';

export const togglePause = (ws: ServerWebSocket<unknown>, data: ToggleMessage) => {
	const roomData = rooms.find((r) => r.id === data.roomID);
	if (!roomData) {
		const error: ResultMessage = {
			success: false,
			message: 'Room not found',
		};
		ws.send(JSON.stringify(error));
		return;
	}
	if (data.isPause) timers[roomData.id].pause();
	else timers[roomData.id].resume();
	ws.publish(roomData.id, JSON.stringify(roomData));
	ws.send(JSON.stringify(roomData));
};
