import type { RankedDivision, RankedTier } from './lol';

export interface AccountReponse {
	puuid: string;
	gameName: string;
	tagLine: string;
}

export interface IdResponse {
	accountId: string; // encrypted account id
	profileIconId: number;
	revisionDate: number;
	id: string; // encrypted summoner id
	puuid: string; // encrypted puuid
	summonerLevel: number;
}

export interface StatsResponse {
	queueType: 'RANKED_SOLO_5x5' | 'RANKED_FLEX_SR';
	tier: RankedTier;
	rank: RankedDivision;
	leaguePoints: number;
	wins: number;
	losses: number;
}

export interface PlayerStats {
	SOLO?: {
		tier: RankedTier;
		rank: RankedDivision;
		leaguePoints: number;
		points: number;
		winRate: number;
	};
	FLEX?: {
		tier: RankedTier;
		rank: RankedDivision;
		leaguePoints: number;
		points: number;
		winRate: number;
	};
}
