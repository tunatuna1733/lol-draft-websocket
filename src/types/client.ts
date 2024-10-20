import type { Lane, Team } from './lol';

type Commands =
	| 'Join'
	| 'Ready'
	| 'SelectBanChamp'
	| 'PickBanChamp'
	| 'SelectChamp'
	| 'PickChamp'
	| 'PickLane'
	| 'RemovePlayer'
	| 'Toggle';

export interface CreateRoomMessage {
	roomName: string;
	team1Name: string;
	team2Name: string;
}

export interface BaseMessage {
	command: Commands;
	roomID: string;
}

export interface JoinMessage extends BaseMessage {
	command: 'Join';
	name: string;
	team: Team;
	beginner?: boolean;
}

export interface ReadyMessage extends BaseMessage {
	command: 'Ready';
	team: Team;
	isReady: boolean;
}

export interface SelectBanChampMessage extends BaseMessage {
	command: 'SelectBanChamp';
	team: Team;
	champ: string;
	order: number;
}

export interface PickBanChampMessage extends BaseMessage {
	command: 'PickBanChamp';
	team: Team;
	champ: string;
	order: number;
}

export interface SelectChampMessage extends BaseMessage {
	command: 'SelectChamp';
	team: Team;
	champ: string;
	order: number;
}

export interface PickChampMessage extends BaseMessage {
	command: 'PickChamp';
	team: Team;
	champ: string;
	order: number;
}

export interface PickLaneMessage extends BaseMessage {
	command: 'PickLane';
	name: string;
	team: Team;
	lane: Lane;
}

export interface RemovePlayerMessage extends BaseMessage {
	command: 'RemovePlayer';
	name: string;
	team: Team;
}

export interface ToggleMessage extends BaseMessage {
	command: 'Toggle';
	isPause: boolean;
}
