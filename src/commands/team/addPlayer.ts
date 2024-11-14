import type { Server } from 'bun';
import type { TeamAddPlayerMessage } from '../../types/team';
import { teams } from '../../data';
import { publishTeamInfo } from '../../util';

export const teamAddPlayer = (server: Server, data: TeamAddPlayerMessage) => {
	const team = teams.find((t) => t.id === data.id);
	if (!team) {
		console.error(`[AddPlayer]Team not found. ID: ${data.id}`);
		return;
	}
	team.Unassigned.push({ name: data.name, icon: data.icon, lane: data.lane, beginner: data.beginner });
	publishTeamInfo(server, team);
};
