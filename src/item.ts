import { type Item, type ItemResponse, statsCategories } from './types/item';

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
