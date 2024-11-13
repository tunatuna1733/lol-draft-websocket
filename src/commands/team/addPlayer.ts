import type { Server } from 'bun';
import type { TeamAddPlayerMessage } from '../../types/team';
import { teams } from '../../data';

export const teamAddPlayer = (server: Server, data: TeamAddPlayerMessage) => {
	const team = teams.find((t) => t.id === data.id);
	if (!team) {
		console.error(`Team not found. ID: ${data.id}`);
		return;
	}
	const id = `team-${team.id}`;
	team.Unassigned.push({ name: data.name, icon: data.icon, lane: data.lane, beginner: data.beginner });
	server.publish(id, JSON.stringify(team));
};
