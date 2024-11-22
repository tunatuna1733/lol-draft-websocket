import type { Lane, Team } from './lol';
import type { Blankable } from './util';

export interface CreateTeamPlayer {
	name: string;
	icon: string;
	beginner: boolean;
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
	| TeamCreateDraftMessage;

interface BaseMessage {
	id: string;
}

export interface TeamPickLaneMessage extends BaseMessage {
	command: 'PickLane';
	name: string;
	lane: Lane;
}

export interface TeamAddPlayerMessage extends BaseMessage {
	command: 'AddPlayer';
	name: string;
	icon: string;
	lane: Blankable<Lane>;
	beginner: boolean;
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

export interface PlayerData {
	name: string;
	icon: string;
	lane: Blankable<Lane>;
	beginner: boolean;
}

export interface TeamCreationData {
	id: string;
	createdTime: number;
	channelId?: string;
	Blue: PlayerData[];
	Red: PlayerData[];
	Unassigned: PlayerData[];
	draftId: string;
}
