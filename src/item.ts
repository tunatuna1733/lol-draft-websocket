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

const getLatestDDragonVersion = () => {
	return '15.17.1';
};

export const getItemList = async () => {
	const URL = `https://ddragon.leagueoflegends.com/cdn/${getLatestDDragonVersion()}/data/en_US/item.json`;

	const res = await fetch(URL);
	const data = (await res.json()) as ItemResponse;

	const itemEntries = Object.entries(data.data);

	const legendaryItems: Item[] = [];
	const bootsItems: Item[] = [];

	for (const [id, item] of itemEntries) {
		if (Number.parseInt(id) >= 10000) continue;
		if (
			item.gold.purchasable &&
			item.maps['11'] &&
			item.into === undefined &&
			item.from !== undefined &&
			item.from.length > 0 &&
			!item.from.includes('3867')
		) {
			if (item.tags.includes('Boots')) {
				bootsItems.push({
					id: Number.parseInt(id),
					name: item.name,
					description: item.description,
					stats: convertStats(item.stats),
				});
			} else {
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
		bootsItems,
	};
};

export const buildRandom = async (options: {
	noAD?: boolean;
	noAP?: boolean;
	noAS?: boolean;
	noRes?: boolean;
	noCrit?: boolean;
}) => {
	const itemList = await getItemList();

	const filteredItems = itemList.legendaryItems.filter((item) => {
		if (options.noAD && item.stats.AD) return false;
		if (options.noAP && item.stats.AP) return false;
		if (options.noAS && item.stats.AS) return false;
		if (options.noRes && (item.stats.AR || item.stats.MR)) return false;
		if (options.noCrit && (item.stats['Crit Chance'] || item.stats['Crit Damage'])) return false;

		return true;
	});

	const shuffled = filteredItems.sort(() => Math.random() - 0.5);
	const selectedItems = shuffled.slice(0, 6);
	return selectedItems;
};
