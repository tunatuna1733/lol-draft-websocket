import { addNPC } from './commands/draft/addNPC';
import { createRoom } from './commands/draft/createRoom';
import { join } from './commands/draft/join';
import { pickBanChamp } from './commands/draft/pickBanChamp';
import { pickChamp } from './commands/draft/pickChamp';
import { pickLane } from './commands/draft/pickLane';
import { ready } from './commands/draft/ready';
import { removePlayer } from './commands/draft/removePlayer';
import { selectBanChamp } from './commands/draft/selectBanChamp';
import { selectChamp } from './commands/draft/selectChamp';
import { sendDraftImage } from './commands/draft/sendDraftImage';
import { setGlobalBans } from './commands/draft/setGlobalBans';
import { start } from './commands/draft/start';
import { swapPlayers } from './commands/draft/swapPlayer';
import { togglePause } from './commands/draft/toggle';
import { teamAddPlayer } from './commands/team/addPlayer';
import { autoAssignPlayer } from './commands/team/autoAssignPlayer';
import { createDraft } from './commands/team/createDraft';
import { createTeam } from './commands/team/createTeam';
import { teamPickLane } from './commands/team/pickLane';
import { teamTransferPlayer } from './commands/team/transferPlayer';
import { teams } from './data';
import type {
	AddNPCMessage,
	BaseMessage,
	DraftImageMessage,
	JoinMessage,
	PickBanChampMessage,
	PickChampMessage,
	PickLaneMessage,
	ReadyMessage,
	RemovePlayerMessage,
	SelectBanChampMessage,
	SelectChampMessage,
	SetGlobalBansMessage,
	StartMessage,
	SwapPlayersMessage,
	ToggleMessage,
} from './types/client';
import type { CreateTeamPayload, TeamCreationData, TeamMessage } from './types/team';
import { parseCookie } from './util';

export const server = Bun.serve<{ roomID?: string; teamID?: string }>({
	port: 443,
	async fetch(req, server) {
		const url = new URL(req.url);
		if (req.method === 'POST' && url.pathname === '/createRoom') {
			const params = url.searchParams;
			const matchName = params.get('matchName') || 'Custom Match';
			const team1Name = params.get('team1Name') || 'Team 1';
			const team2Name = params.get('team2Name') || 'Team 2';
			const contentLength = req.headers.get('Content-Length');
			const data: TeamCreationData | null = contentLength && contentLength !== '0' && (await req.json());
			const teamData = data && { Blue: data.Blue, Red: data.Red };
			const id = createRoom(
				{
					roomName: matchName,
					team1Name,
					team2Name,
				},
				undefined,
				teamData,
			);
			const response = new Response(JSON.stringify({ id }));
			if (req.headers.get('Origin') === 'http://localhost:3000')
				response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
			else response.headers.set('Access-Control-Allow-Origin', 'https://lol.tunatuna.dev');
			response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
			response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
			return response;
		}
		if (req.method === 'POST' && url.pathname === '/createTeam') {
			const data: CreateTeamPayload = await req.json();
			const id = createTeam(data);
			const response = new Response(JSON.stringify({ id }));
			if (req.headers.get('Origin') === 'http://localhost:3000')
				response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
			else response.headers.set('Access-Control-Allow-Origin', 'https://lol.tunatuna.dev');
			response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
			response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
			return response;
		}
		const cookies = req.headers.get('cookies');
		const roomID = cookies && parseCookie(cookies).roomID;
		const teamID = new URL(req.url).searchParams.get('teamID');
		const success = server.upgrade(req, { data: { roomID, teamID } });
		if (success) {
			return undefined;
		}
		return new Response('Hello World!');
	},
	websocket: {
		idleTimeout: 600,
		open(ws) {
			if (ws.data.teamID) {
				ws.subscribe(`team-${ws.data.teamID}`);
				const team = teams.find((t) => t.id === ws.data.teamID);
				if (team) ws.send(JSON.stringify(team));
			}
		},
		message(ws, message) {
			if (typeof message !== 'string') return;
			if (ws.data.teamID) {
				// team creation messages
				const parsedMessage: TeamMessage = JSON.parse(message);
				switch (parsedMessage.command) {
					case 'AddPlayer':
						teamAddPlayer(server, parsedMessage);
						break;
					case 'PickLane':
						teamPickLane(server, parsedMessage);
						break;
					case 'TransferPlayer':
						teamTransferPlayer(server, parsedMessage);
						break;
					case 'AutoAssignPlayer':
						autoAssignPlayer(parsedMessage, server);
						break;
					case 'CreateDraft':
						createDraft(server, parsedMessage.id);
						break;
					default:
						console.warn('Unknown command');
				}
			} else {
				const parsedMessage: BaseMessage = JSON.parse(message);
				switch (parsedMessage.command) {
					case 'Join':
						join(ws, parsedMessage as JoinMessage, server);
						break;
					case 'Ready':
						ready(ws, parsedMessage as ReadyMessage);
						break;
					case 'Start':
						start(ws, parsedMessage as StartMessage);
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
					case 'DraftImage':
						sendDraftImage(parsedMessage as DraftImageMessage);
						break;
					case 'SetGlobalBans':
						setGlobalBans(ws, parsedMessage as SetGlobalBansMessage);
						break;
					default:
						console.warn('Unknown command:', parsedMessage.command);
				}
			}
		},
		close(ws) {
			if (ws.data.roomID) {
				ws.unsubscribe(ws.data.roomID);
			}
			if (ws.data.teamID) {
				ws.unsubscribe(`team-${ws.data.teamID}`);
			}
		},
	},
});

console.info(`Started websocket server on ${server.hostname}:${server.port}`);
