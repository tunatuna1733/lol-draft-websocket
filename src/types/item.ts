export type ItemData = {
	name: string;
	description: string;
	colloq: string;
	plaintext: string;
	into?: string[];
	image: ItemImage;
	gold: ItemGold;
	tags: ItemTag[];
	maps: { [key: string]: boolean };
	stats: { [key: string]: number };
	from?: string[];
	depth?: number;
	inStore?: boolean;
	effect?: never;
	consumed?: boolean;
	stacks?: number;
	hideFromAll?: boolean;
	consumeOnFull?: boolean;
	specialRecipe?: number;
	requiredChampion?: string;
};

export type ItemGold = {
	base: number;
	total: number;
	sell: number;
	purchasable: boolean;
};

export type ItemTag =
	| 'Boots'
	| 'ManaRegen'
	| 'HealthRegen'
	| 'Health'
	| 'CriticalStrike'
	| 'SpellDamage'
	| 'Mana'
	| 'Armor'
	| 'SpellBlock'
	| 'LifeSteal'
	| 'SpellVamp'
	| 'Jungle'
	| 'Damage'
	| 'Lane'
	| 'AttackSpeed'
	| 'OnHit'
	| 'Trinket'
	| 'Active'
	| 'Consumable'
	| 'CooldownReduction'
	| 'ArmorPenetration'
	| 'AbilityHaste'
	| 'Stealth'
	| 'Vision'
	| 'NonbootsMovement'
	| 'Tenacity'
	| 'MagicPenetration'
	| 'Aura'
	| 'Slow'
	| 'MagicResist'
	| 'GoldPer';

export type ItemImage = {
	full: string;
	sprite: never;
	group: never;
	x: number;
	y: number;
	w: number;
	h: number;
};

export type ItemResponse = {
	data: { [key: string]: ItemData };
};

export type Item = {
	id: number;
	name: string;
	description: string;
	stats: { [key: string]: number };
};

export const statsCategories: { [key: string]: string } = {
	// Health Pool & Regeneration
	FlatHPPoolMod: 'HP',
	PercentHPPoolMod: 'HP%',
	FlatHPRegenMod: 'HP Regen',
	PercentHPRegenMod: 'HP Regen%',

	// Mana Pool & Regeneration
	FlatMPPoolMod: 'Mana',
	PercentMPPoolMod: 'Mana%',
	FlatMPRegenMod: 'Mana Regen',
	PercentMPRegenMod: 'Mana Regen%',

	// Energy Pool & Regeneration
	FlatEnergyPoolMod: 'Energy',
	FlatEnergyRegenMod: 'Energy Regen',

	// Armor & Physical Defense
	FlatArmorMod: 'AR',

	// Physical Damage
	FlatPhysicalDamageMod: 'AD',

	// Magic Damage
	FlatMagicDamageMod: 'AP',

	// Movement Speed
	FlatMovementSpeedMod: 'MS',
	PercentMovementSpeedMod: 'MS%',

	// Attack Speed
	PercentAttackSpeedMod: 'AS',

	// Critical Hit Chance
	FlatCritChanceMod: 'Crit Chance',

	// Critical Hit Damage
	FlatCritDamageMod: 'Crit Damage',

	// Spell Block (Magic)
	FlatSpellBlockMod: 'MR',

	// Life Steal & Spell Vamp
	PercentLifeStealMod: 'Life Steal',
};
