import type { ServerWebSocket } from 'bun';
import type { JoinMessage } from '../../types/client';
import { rooms } from '../../data';
import type { PlayerData } from '../../types/room';
import type { MakeSpec, ResultMessage } from '../../types/server';

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
	if (data.isSpec) {
		const payload: MakeSpec = {
			command: 'MakeSpec',
			roomID: roomData.id,
		};
		ws.send(JSON.stringify(payload));
		ws.send(JSON.stringify(roomData));
		ws.subscribe(roomData.id);
		return;
	}
	const player: PlayerData = {
		name: data.name,
		team: data.team,
		lane: '',
		champ: '',
		isNPC: false,
	};
	if (!roomData.teams[data.team].players.find((p) => p.name === data.name)) {
		if (roomData.teams[data.team].players.length >= 5) {
			// search for npc
			const npcIndex = roomData.teams[data.team].players.findIndex((p) => p.isNPC);
			if (npcIndex === -1) {
				// the team is full
				const payload: MakeSpec = {
					command: 'MakeSpec',
					roomID: roomData.id,
				};
				ws.send(JSON.stringify(payload));
				ws.send(JSON.stringify(roomData));
				ws.subscribe(roomData.id);
				return;
			}
			// replace npc
			roomData.teams[data.team].players[npcIndex] = player;
		} else roomData.teams[data.team].players.push(player);
	}
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
};
