import type { Server } from 'bun';
import type { TeamAutoAssignPlayerMessage } from '../../types/team';
import { teams } from '../../data';
import { publishTeamInfo } from '../../util';

// this command can also be used as util function
export const autoAssignPlayer = (data: TeamAutoAssignPlayerMessage, server?: Server) => {
	const team = teams.find((t) => t.id === data.id);
	if (!team) {
		console.error(`[AutoAssignPlayer]Team not found. ID: ${data.id}`);
		return;
	}
	const player = team.Unassigned.find((p) => p.name === data.name);
	if (!player) {
		// we do not have to log this error
		// console.error(`[AutoAssignPlayer]Player not found. name: ${data.name}`);
		return;
	}
	team.Unassigned = team.Unassigned.filter((p) => p.name !== data.name);
	if (team.Blue.find((b) => b.lane === player.lane) === undefined) {
		team.Blue.push(player);
	} else if (team.Red.find((r) => r.lane === player.lane) === undefined) {
		team.Red.push(player);
	} else {
		team.Blue.length > team.Red.length ? team.Red.push(player) : team.Blue.push(player);
	}
	if (server) publishTeamInfo(server, team);
};
