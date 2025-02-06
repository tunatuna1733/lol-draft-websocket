import type { Server } from 'bun';
import { teams } from '../../data';
import type { TeamPickLaneMessage } from '../../types/team';
import { publishTeamInfo } from '../../util';
import { autoAssignPlayer } from './autoAssignPlayer';

export const teamPickLane = (server: Server, data: TeamPickLaneMessage) => {
	const team = teams.find((t) => t.id === data.id);
	if (!team) {
		console.error(`[PickLane]Team not found. ID: ${data.id}`);
		return;
	}
	const player = [...team.Blue, ...team.Red, ...team.Unassigned].find((p) => p.name === data.name);
	if (!player) {
		console.error(`[PickLane]Player not found. name: ${data.name}`);
		return;
	}
	player.lane = data.lane;
	if (player.lane !== '') autoAssignPlayer({ command: 'AutoAssignPlayer', id: data.id, name: player.name });
	publishTeamInfo(server, team);
};
