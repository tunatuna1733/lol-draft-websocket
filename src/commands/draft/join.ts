import type { Server, ServerWebSocket } from 'bun';
import { rooms } from '../../data';
import type { JoinMessage } from '../../types/client';
import type { DraftPlayerData } from '../../types/room';
import type { MakeSpec, ResultMessage } from '../../types/server';

export const join = (ws: ServerWebSocket<unknown>, data: JoinMessage, server: Server, clientUuid: string) => {
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
	if (data.bypass) {
		ws.subscribe(roomData.id);
		ws.send(JSON.stringify(roomData));
		return;
	}
	const player: DraftPlayerData = {
		name: data.name,
		team: data.team,
		lane: '',
		champ: '',
		isNPC: false,
		uuid: clientUuid,
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
	ws.subscribe(roomData.id);
	server.publish(roomData.id, JSON.stringify(roomData));
	ws.send(JSON.stringify(roomData));
};
