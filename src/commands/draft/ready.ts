import type { ServerWebSocket } from 'bun';
import type { ReadyMessage } from '../../types/client';
import { rooms, timers } from '../../data';
import type { ResultMessage } from '../../types/server';
import { DraftTimer } from '../../draft';
import { generateRandomString } from '../../util';

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
	if (roomData.teams.Blue.isReady && roomData.teams.Red.isReady) {
		while (roomData.teams.Blue.players.length < 5) {
			roomData.teams.Blue.players.push({
				name: `RandomPlayer-${generateRandomString(4)}`,
				team: 'Blue',
				lane: '',
				champ: '',
				isNPC: true,
				isBeginner: false,
			});
		}
		while (roomData.teams.Red.players.length < 5) {
			roomData.teams.Red.players.push({
				name: `RandomPlayer-${generateRandomString(4)}`,
				team: 'Red',
				lane: '',
				champ: '',
				isNPC: true,
				isBeginner: false,
			});
		}
		// start draft
		if (roomData.starting === false) {
			roomData.starting = true;
			ws.publish(roomData.id, JSON.stringify(roomData));
			ws.send(JSON.stringify(roomData));
			setTimeout(() => {
				roomData.started = true;
				const timer = new DraftTimer(ws, roomData);
				timer.start();
				timers[roomData.id] = timer;
			}, 5 * 1000);
		}
	}
};
