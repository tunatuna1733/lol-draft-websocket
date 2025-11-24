import type { Lane, RankedDivision, RankedTier, Team } from './lol';
import type { Blankable } from './util';

export interface CreateTeamPlayer {
	id?: string;
	name: string;
	icon: string;
	lane: Blankable<Lane>;
	level: number;
	elo: number;
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

export interface CreateTeamPayload {
	players: CreateTeamPlayer[];
	channelId?: string;
}

export type TeamMessage =
	| TeamPickLaneMessage
	| TeamAddPlayerMessage
	| TeamTransferPlayerMessage
	| TeamAutoAssignPlayerMessage
	| TeamCreateDraftMessage
	| TeamBalanceMessage;

interface BaseMessage {
	id: string;
}

export interface TeamPickLaneMessage extends BaseMessage {
	command: 'PickLane';
	name: string;
	lane: Blankable<Lane>;
}

export interface TeamAddPlayerMessage extends BaseMessage {
	command: 'AddPlayer';
	name: string;
	icon?: string;
	lane: Blankable<Lane>;
	beginner: boolean;
	gameName?: string;
	tagLine?: string;
}

export interface TeamTransferPlayerMessage extends BaseMessage {
	command: 'TransferPlayer';
	name: string;
	team: Team | 'Unassigned';
}

export interface TeamAutoAssignPlayerMessage extends BaseMessage {
	command: 'AutoAssignPlayer';
	name: string;
}

export interface TeamCreateDraftMessage extends BaseMessage {
	command: 'CreateDraft';
}

export interface TeamBalanceMessage extends BaseMessage {
	command: 'Balance';
	excludeJungle: boolean;
	balancingRank: number;
}

export type PlayerData = CreateTeamPlayer;

export interface TeamCreationData {
	id: string;
	createdTime: number;
	channelId?: string;
	Blue: PlayerData[];
	Red: PlayerData[];
	Unassigned: PlayerData[];
	draftId: string;
}
