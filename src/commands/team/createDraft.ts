import type { Server } from 'bun';
import { teams } from '../../data';
import { publishTeamInfo } from '../../util';
import { createRoom } from '../draft/createRoom';

export const createDraft = (server: Server, teamId: string) => {
	const team = teams.find((t) => t.id === teamId);
	if (!team) {
		console.error(`[CreateDraft]Team not found. ID: ${teamId}`);
		return;
	}
	const draftId = createRoom({ roomName: 'Custom Match', team1Name: 'Team 1', team2Name: 'Team 2' }, team);
	team.draftId = draftId;
	publishTeamInfo(server, team);
};
