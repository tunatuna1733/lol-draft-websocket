import type { Server } from 'bun';
import type { TeamAutoAssignPlayerMessage } from '../../types/team';
import { teams } from '../../data';
import { publishTeamInfo } from '../../util';

// this command can also be used as util function
export const autoAssignPlayer = (data: TeamAutoAssignPlayerMessage, server?: Server) => {
	// TODO: consider lane
	const team = teams.find((t) => t.id === data.id);
	if (!team) {
		console.error(`Team not found. ID: ${data.id}`);
		return;
	}
	const id = `team-${team.id}`;
	const player = team.Unassigned.find((p) => p.name === data.name);
	if (!player) {
		console.error(`Player not found. name: ${data.name}`);
		return;
	}
	team.Unassigned = team.Unassigned.filter((p) => p.name !== data.name);
	team.Blue.length > team.Red.length ? team.Red.push(player) : team.Blue.push(player);
	if (server) publishTeamInfo(server, team);
};
