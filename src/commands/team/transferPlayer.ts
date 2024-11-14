import type { Server } from 'bun';
import type { PlayerData, TeamTransferPlayerMessage } from '../../types/team';
import { teams } from '../../data';
import { publishTeamInfo } from '../../util';

export const teamTransferPlayer = (server: Server, data: TeamTransferPlayerMessage) => {
	const team = teams.find((t) => t.id === data.id);
	if (!team) {
		console.error(`Team not found. ID: ${data.id}`);
		return;
	}
	const id = `team-${team.id}`;
	let player: PlayerData | null = null;
	if (data.team !== 'Blue') {
		const bp = team.Blue.find((p) => p.name === data.name);
		if (bp) {
			player = bp;
			team.Blue = team.Blue.filter((p) => p.name !== data.name);
		}
	}
	if (data.team !== 'Red') {
		const rp = team.Red.find((p) => p.name === data.name);
		if (rp) {
			player = rp;
			team.Red = team.Red.filter((p) => p.name !== data.name);
		}
	}
	if (data.team !== 'Unassigned') {
		const up = team.Blue.find((p) => p.name === data.name);
		if (up) {
			player = up;
			team.Unassigned = team.Unassigned.filter((p) => p.name !== data.name);
		}
	}
	if (!player) {
		console.error(`Player not found. name: ${data.name}`);
		return;
	}
	team[data.team].push(player);
	publishTeamInfo(server, team);
};
