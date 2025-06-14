import type { Server } from 'bun';
import { teams } from '../../data';
import type { PlayerData, TeamBalanceMessage } from '../../types/team';
import { publishTeamInfo } from '../../util';

export const teamBalance = (server: Server, data: TeamBalanceMessage) => {
	const team = teams.find((t) => t.id === data.id);
	if (!team) {
		console.error(`[TeamBalance]Team not found. ID: ${data.id}`);
		return;
	}
	if (team.Blue.length !== 5 || team.Red.length !== 5) {
		console.error(`[TeamBalance]Team does not have 5 players. ID: ${data.id}`);
		return;
	}
	if (!team.Blue.every((p) => p.elo && p.elo !== 0) || !team.Red.every((p) => p.elo && p.elo !== 0)) {
		console.error(`[TeamBalance]No Elo info. ID: ${data.id}`);
		return;
	}
	const candidates: { blue: PlayerData[]; red: PlayerData[]; diff: number }[] = [];
	if (!data.excludeJungle) {
		const players = [...team.Blue, ...team.Red];
		// normal balancing
		for (let i = 0; i <= 5; i++) {
			for (let j = i + 1; j <= 6; j++) {
				for (let k = j + 1; k <= 7; k++) {
					for (let l = k + 1; l <= 8; l++) {
						for (let m = l + 1; m <= 9; m++) {
							const blue = [players[i], players[j], players[k], players[l], players[m]];
							const red = players.filter((p) => !blue.includes(p));
							candidates.push({
								blue,
								red,
								diff: 0,
							});
						}
					}
				}
			}
		}
	} else {
		// exclude jungle
		const blueJug = team.Blue.find((p) => p.lane === 'Jungle');
		const redJug = team.Red.find((p) => p.lane === 'Jungle');
		if (!blueJug || !redJug) {
			console.error(`[TeamBalance]Team does not have a jungle player. ID: ${data.id}`);
			return;
		}
		const players = [...team.Blue.filter((p) => p.lane !== 'Jungle'), ...team.Red.filter((p) => p.lane !== 'Jungle')];
		for (let i = 0; i <= 4; i++) {
			for (let j = i + 1; j <= 5; j++) {
				for (let k = j + 1; k <= 6; k++) {
					for (let l = k + 1; l <= 7; l++) {
						const blue = [players[i], players[j], players[k], players[l]];
						const red = players.filter((p) => !blue.includes(p));
						candidates.push({
							blue: [...blue, blueJug],
							red: [...red, redJug],
							diff: 0,
						});
						candidates.push({
							blue: [...blue, redJug],
							red: [...red, blueJug],
							diff: 0,
						});
					}
				}
			}
		}
	}
	for (const candidate of candidates) {
		candidate.diff = Math.abs(
			candidate.blue.reduce((acc, p) => acc + p.elo, 0) - candidate.red.reduce((acc, p) => acc + p.elo, 0),
		);
	}
	candidates.sort((a, b) => b.diff - a.diff).reverse();

	team.Blue = candidates[0].blue;
	team.Red = candidates[0].red;

	publishTeamInfo(server, team);
};
