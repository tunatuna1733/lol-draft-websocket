import type { Server } from 'bun';
import { teams } from '../../data';
import { calcElo, getIds, getPlayerStats, getProfileIconUrl, getPuuid } from '../../riot';
import type { TeamAddPlayerMessage } from '../../types/team';
import { publishTeamInfo } from '../../util';

export const teamAddPlayer = async (server: Server, data: TeamAddPlayerMessage) => {
	const team = teams.find((t) => t.id === data.id);
	if (!team) {
		console.error(`[AddPlayer]Team not found. ID: ${data.id}`);
		return;
	}
	if (data.gameName && data.tagLine) {
		// fetch player info
		// we use lol icon instead of discord icon here
		const puuid = await getPuuid(data.gameName, data.tagLine);
		const stats = await getPlayerStats(puuid);
		const ids = await getIds(puuid);
		const profileIconUrl = await getProfileIconUrl(ids?.profileIconId || 588);
		team.Unassigned.push({
			name: data.name,
			icon: profileIconUrl,
			lane: data.lane,
			level: ids?.summonerLevel || 0,
			elo: calcElo(
				stats?.SOLO?.points || 0,
				stats?.FLEX?.points || 0,
				ids?.summonerLevel || 0,
				stats?.SOLO?.winRate || 0,
			),
			SOLO: stats?.SOLO,
			FLEX: stats?.FLEX,
		});
	} else {
		if (data.icon) {
			team.Unassigned.push({ name: data.name, icon: data.icon, lane: data.lane, level: 0, elo: 0 });
		} else {
			team.Unassigned.push({
				name: data.name,
				icon: 'https://ddragon.leagueoflegends.com/cdn/15.23.1/img/profileicon/588.png',
				lane: data.lane,
				level: 0,
				elo: 0,
			});
		}
	}
	publishTeamInfo(server, team);
};
