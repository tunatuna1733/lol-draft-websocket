import type { Server } from 'bun';
import type { TeamPickLaneMessage } from '../../types/team';
import { teams } from '../../data';

export const teamPickLane = (server: Server, data: TeamPickLaneMessage) => {
	const team = teams.find((t) => t.id === data.id);
	if (!team) {
		console.error(`Team not found. ID: ${data.id}`);
		return;
	}
	const id = `team-${team.id}`;
	const player = [...team.Blue, ...team.Red, ...team.Unassigned].find((p) => p.name === data.name);
	if (!player) {
		console.error(`Player not found. name: ${data.name}`);
		return;
	}
	player.lane = data.lane;
	server.publish(id, JSON.stringify(team));
};
