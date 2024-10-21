import type { Lane, Team } from './lol';
import type { PhaseData } from './room';

export interface ResultMessage {
	success: boolean;
	message?: string;
}

type Commands =
	| 'StartPhase'
	| 'PlayerJoin'
	| 'PlayerLane'
	| 'SelectBanChamp'
	| 'PickBanChamp'
	| 'SelectChamp'
	| 'PickChamp'
	| 'PickLane'
	| 'MakeSpec';

export interface BaseMessage {
	command: Commands;
	roomID: string;
}

export interface StartPhase extends PhaseData {
	command: 'StartPhase';
}

export interface CurrentPhase extends PhaseData {
	command: 'CurrentPhase';
}

export interface MakeSpec extends BaseMessage {
	command: 'MakeSpec';
}

export interface PlayerJoin {
	command: 'PlayerJoin';
	name: string;
	team: Team;
}

export interface SelectBanChamp {
	command: 'SelectBanChamp';
	team: Team;
	champ: string;
	order: number;
}

export interface PickBanChamp {
	command: 'PickBanChamp';
	team: Team;
	champ: string;
	order: number;
}

export interface SelectChamp {
	command: 'SelectChamp';
	name: string;
	team: Team;
	champ: string;
	order: number;
}

export interface PickChamp {
	command: 'PickChamp';
	name: string;
	team: Team;
	champ: string;
	order: number;
}

export interface PickLane {
	command: 'PickLane';
	name: string;
	team: Team;
	lane: Lane;
}
