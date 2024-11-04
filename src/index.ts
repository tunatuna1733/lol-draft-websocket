import { addNPC } from './commands/client/addNPC';
import { createRoom } from './commands/client/createRoom';
import { join } from './commands/client/join';
import { pickBanChamp } from './commands/client/pickBanChamp';
import { pickChamp } from './commands/client/pickChamp';
import { pickLane } from './commands/client/pickLane';
import { ready } from './commands/client/ready';
import { removePlayer } from './commands/client/removePlayer';
import { selectBanChamp } from './commands/client/selectBanChamp';
import { selectChamp } from './commands/client/selectChamp';
import { swapPlayers } from './commands/client/swapPlayer';
import { togglePause } from './commands/client/toggle';
import type {
	AddNPCMessage,
	BaseMessage,
	JoinMessage,
	PickBanChampMessage,
	PickChampMessage,
	PickLaneMessage,
	ReadyMessage,
	RemovePlayerMessage,
	SelectBanChampMessage,
	SelectChampMessage,
	SwapPlayersMessage,
	ToggleMessage,
} from './types/client';
import { parseCookie } from './util';

const server = Bun.serve<{ roomID?: string }>({
	port: 443,
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
			response.headers.set('Access-Control-Allow-Origin', 'https://lol.tunatuna.dev');
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
			const parsedMessage: BaseMessage = JSON.parse(message);
			switch (parsedMessage.command) {
				case 'Join':
					join(ws, parsedMessage as JoinMessage, server);
					break;
				case 'Ready':
					ready(ws, parsedMessage as ReadyMessage);
					break;
				case 'SelectBanChamp':
					selectBanChamp(ws, parsedMessage as SelectBanChampMessage);
					break;
				case 'PickBanChamp':
					pickBanChamp(ws, parsedMessage as PickBanChampMessage);
					break;
				case 'SelectChamp':
					selectChamp(ws, parsedMessage as SelectChampMessage);
					break;
				case 'PickChamp':
					pickChamp(ws, parsedMessage as PickChampMessage);
					break;
				case 'PickLane':
					pickLane(ws, parsedMessage as PickLaneMessage);
					break;
				case 'RemovePlayer':
					removePlayer(ws, parsedMessage as RemovePlayerMessage);
					break;
				case 'Toggle':
					togglePause(ws, parsedMessage as ToggleMessage);
					break;
				case 'AddNPC':
					addNPC(ws, parsedMessage as AddNPCMessage);
					break;
				case 'SwapPlayers':
					swapPlayers(ws, parsedMessage as SwapPlayersMessage);
					break;
				default:
					console.warn('Unknown command:', parsedMessage.command);
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
