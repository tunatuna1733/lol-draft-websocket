import { type Item, type ItemResponse, statsCategories } from './types/item';
import type { RankedDivision, RankedTier } from './types/lol';
import type { AccountReponse, IdResponse, PlayerStats, StatsResponse } from './types/riot';

const API_KEY = process.env.RIOT_API_KEY;
if (!API_KEY) {
	console.error('Failed to get Riot API Key');
	process.exit(1);
}
const headers = {
	'X-Riot-Token': API_KEY,
};

const convertStats = (stats: { [key: string]: number }) => {
	const statsEntries = Object.entries(stats);
	const formattedStats: { [key: string]: number } = {};
	for (const [rawStatsName, value] of statsEntries) {
		const formattedName = statsCategories[rawStatsName];
		if (!formattedName) continue;
		formattedStats[formattedName] = value;
	}
	return formattedStats;
};

const getLatestDDragonVersion = async () => {
	const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
	const versions = (await response.json()) as string[];
	return versions[0];
};

export const getItemList = async () => {
	const version = await getLatestDDragonVersion();
	const URL = `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/item.json`;

	const res = await fetch(URL);
	const data = (await res.json()) as ItemResponse;

	const itemEntries = Object.entries(data.data);

	const legendaryItems: Item[] = [];
	const supportItems: Item[] = [];
	const t2bootsItems: Item[] = [];
	const t3bootsItems: Item[] = [];

	const baseBootsID = 1001;
	const symbioticID = 3010;

	const t3bootsIDs: string[] = [];

	for (const [id, item] of itemEntries) {
		if (Number.parseInt(id) >= 10000) continue;
		if (item.gold.purchasable && item.maps['11']) {
			if (item.from?.includes(baseBootsID.toString())) {
				// t2 boots
				if (id === symbioticID.toString()) {
					const synchronizedSoulsID = item.into?.[0] || ''; // it should always exist
					const synchronizedSoulsData = data.data[synchronizedSoulsID];
					t2bootsItems.push({
						id: Number.parseInt(synchronizedSoulsID),
						name: synchronizedSoulsData.name,
						description: synchronizedSoulsData.description,
						stats: convertStats(synchronizedSoulsData.stats),
					});
					if (synchronizedSoulsData.into?.[0]) t3bootsIDs.push(synchronizedSoulsData.into[0]);
				} else {
					t2bootsItems.push({
						id: Number.parseInt(id),
						name: item.name,
						description: item.description,
						stats: convertStats(item.stats),
					});
					if (item.into?.[0]) t3bootsIDs.push(item.into[0]);
				}
			} else if (item.from?.includes('3867')) {
				// support items
				supportItems.push({
					id: Number.parseInt(id),
					name: item.name,
					description: item.description,
					stats: convertStats(item.stats),
				});
			}
		}
	}

	for (const [id, item] of itemEntries) {
		if (Number.parseInt(id) >= 10000) continue;
		if (item.gold.purchasable && item.maps['11']) {
			if (t3bootsIDs.includes(id)) {
				t3bootsItems.push({
					id: Number.parseInt(id),
					name: item.name,
					description: item.description,
					stats: convertStats(item.stats),
				});
			} else if (
				item.into === undefined &&
				item.from !== undefined &&
				item.from.length > 0 &&
				!item.from.includes('3867')
			) {
				legendaryItems.push({
					id: Number.parseInt(id),
					name: item.name,
					description: item.description,
					stats: convertStats(item.stats),
				});
			}
		}
	}

	return {
		legendaryItems,
		supportItems,
		t2bootsItems,
		t3bootsItems,
	};
};

export const buildRandom = async (options: {
	noAD?: boolean;
	noAP?: boolean;
	noAS?: boolean;
	noRes?: boolean;
	noCrit?: boolean;
	isSupport?: boolean;
}) => {
	const itemList = await getItemList();

	const filteredLegendaryItems = itemList.legendaryItems.filter((item) => {
		if (options.noAD && item.stats.AD) return false;
		if (options.noAP && item.stats.AP) return false;
		if (options.noAS && item.stats.AS) return false;
		if (options.noRes && (item.stats.AR || item.stats.MR)) return false;
		if (options.noCrit && (item.stats['Crit Chance'] || item.stats['Crit Damage'])) return false;

		return true;
	});

	const shuffled = filteredLegendaryItems.sort(() => Math.random() - 0.5);
	const selectedItems = shuffled.slice(0, options.isSupport ? 4 : 5);
	if (options.isSupport) {
		const supportItem = itemList.supportItems[Math.floor(Math.random() * itemList.supportItems.length)];
		selectedItems.unshift(supportItem);
	}

	const filteredT3Boots = itemList.t3bootsItems.filter((item) => {
		if (options.noAP && item.id === 3175) return false;
		if (options.noAS && item.stats.AS) return false;
		if (options.noRes && (item.stats.AR || item.stats.MR)) return false;

		return true;
	});

	const selectedT3Boots = filteredT3Boots.sort(() => Math.random() - 0.5)[0];

	return [selectedT3Boots, ...selectedItems];
};

export const getPuuid = async (gameName: string, tagLine: string) => {
	const url = `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`;
	const res = await fetch(url, { headers });
	if (!res.ok) {
		throw new Error(`Failed to fetch player data: ${res.status} ${res.statusText}`);
	}
	const accountData = (await res.json()) as AccountReponse;
	return accountData.puuid;
};

const calcRankedPoints = (tier: RankedTier, div: RankedDivision, points: number) => {
	let elo = 0;
	switch (tier) {
		case 'BRONZE':
			elo += 400;
			break;
		case 'SILVER':
			elo += 800;
			break;
		case 'GOLD':
			elo += 1200;
			break;
		case 'PLATINUM':
			elo += 1600;
			break;
		case 'EMERALD':
			elo += 2000;
			break;
		case 'DIAMOND':
			elo += 2400;
			break;
		case 'MASTER':
			elo += 2800;
			break;
		case 'GRANDMASTER':
			elo += 3200;
			break;
		case 'CHALLENGER':
			elo += 3600;
			break;
		default:
			break;
	}
	switch (div) {
		case 'I':
			elo += 300;
			break;
		case 'II':
			elo += 200;
			break;
		case 'III':
			elo += 100;
			break;
		case 'IV':
			elo += 0;
			break;
		default:
			break;
	}
	elo += points;
	return elo;
};

export const getPlayerStats = async (puuid: string) => {
	const res = await fetch(`https://jp1.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`, {
		headers,
	});
	if (!res.ok || res.status === 404) return;
	const json = (await res.json()) as StatsResponse[];
	const data: PlayerStats = {};
	for (const entry of json) {
		if (entry.queueType === 'RANKED_SOLO_5x5') {
			data.SOLO = {
				tier: entry.tier,
				rank: entry.rank,
				leaguePoints: entry.leaguePoints,
				points: calcRankedPoints(entry.tier, entry.rank, entry.leaguePoints),
				winRate: entry.wins / (entry.wins + entry.losses),
			};
		} else if (entry.queueType === 'RANKED_FLEX_SR') {
			data.FLEX = {
				tier: entry.tier,
				rank: entry.rank,
				leaguePoints: entry.leaguePoints,
				points: calcRankedPoints(entry.tier, entry.rank, entry.leaguePoints),
				winRate: entry.wins / (entry.wins + entry.losses),
			};
		}
	}
	return data;
};

export const getIds = async (puuid: string) => {
	const res = await fetch(`https://jp1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`, { headers });
	if (!res.ok) return;
	const json = (await res.json()) as IdResponse;
	return json;
};

export const calcElo = (soloPoints: number, flexPoints: number, level: number, soloWinrate: number) => {
	const elo =
		level * 2 + soloPoints * (soloWinrate > 0.5 ? 1.2 : 1.1) + (flexPoints === 0 ? soloPoints * 0.5 : flexPoints * 0.8);
	return elo;
};

export const getProfileIconUrl = async (iconId: number) => {
	return `https://ddragon.leagueoflegends.com/cdn/${await getLatestDDragonVersion()}/img/profileicon/${iconId}.png`;
};
