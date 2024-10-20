import { createRoom } from './commands/client/createRoom';
import { join } from './commands/client/join';
import { pickBanChamp } from './commands/client/pickBanChamp';
import { pickChamp } from './commands/client/pickChamp';
import { pickLane } from './commands/client/pickLane';
import { ready } from './commands/client/ready';
import { removePlayer } from './commands/client/removePlayer';
import { selectBanChamp } from './commands/client/selectBanChamp';
import { selectChamp } from './commands/client/selectChamp';
import type {
	BaseMessage,
	JoinMessage,
	PickBanChampMessage,
	PickChampMessage,
	PickLaneMessage,
	ReadyMessage,
	RemovePlayerMessage,
	SelectBanChampMessage,
	SelectChampMessage,
} from './types/client';
import { parseCookie } from './util';

const server = Bun.serve<{ roomID?: string }>({
	fetch(req, server) {
		const url = new URL(req.url);
		if (url.pathname === '/createRoom') {
			const params = url.searchParams;
			const matchName = params.get('matchName') || 'Custom Match';
			const team1Name = params.get('team1Name') || 'Team 1';
			const team2Name = params.get('team2Name') || 'Team 2';
			const id = createRoom({
				roomName: matchName,
				team1Name,
				team2Name,
			});
			const response = new Response(JSON.stringify({ id }));
			response.headers.set('Access-Control-Allow-Origin', '*');
			response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
			response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
			return response;
		}
		const cookies = req.headers.get('cookies');
		const roomID = cookies && parseCookie(cookies).roomID;
		const success = server.upgrade(req, { data: { roomID } });
		if (success) {
			return undefined;
		}
		return new Response('Hello World!');
	},
	websocket: {
		open(ws) {
			// handle join event in message
		},
		message(ws, message) {
			if (typeof message !== 'string') return;
			console.log(message);
			const parsedMessage: BaseMessage = JSON.parse(message);
			if (parsedMessage.command === 'Join') {
				const data = parsedMessage as JoinMessage;
				join(ws, data);
			} else if (parsedMessage.command === 'Ready') {
				const data = parsedMessage as ReadyMessage;
				ready(ws, data);
			} else if (parsedMessage.command === 'SelectBanChamp') {
				const data = parsedMessage as SelectBanChampMessage;
				selectBanChamp(ws, data);
			} else if (parsedMessage.command === 'PickBanChamp') {
				const data = parsedMessage as PickBanChampMessage;
				pickBanChamp(ws, data);
			} else if (parsedMessage.command === 'SelectChamp') {
				const data = parsedMessage as SelectChampMessage;
				selectChamp(ws, data);
			} else if (parsedMessage.command === 'PickChamp') {
				const data = parsedMessage as PickChampMessage;
				pickChamp(ws, data);
			} else if (parsedMessage.command === 'PickLane') {
				const data = parsedMessage as PickLaneMessage;
				pickLane(ws, data);
			} else if (parsedMessage.command === 'RemovePlayer') {
				const data = parsedMessage as RemovePlayerMessage;
				removePlayer(ws, data);
			}
		},
		close(ws) {
			if (ws.data.roomID) {
				ws.unsubscribe(ws.data.roomID);
			}
		},
	},
});

console.info(`Started websocket server on ${server.hostname}:${server.port}`);
