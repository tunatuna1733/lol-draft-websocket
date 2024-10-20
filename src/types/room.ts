import type { Lane, Team } from './lol';
import type { Blankable } from './util';

export interface PlayerData {
	name: string;
	team: Team;
	lane: Blankable<Lane>;
	champ: string;
	isNPC: boolean;
}

export interface PhaseData {
	kind: 'Ban' | 'Pick';
	team: Team;
	order: number;
	eta: number;
	paused: boolean;
}

interface TeamData {
	name: string;
	players: PlayerData[];
	bans: string[];
	isReady: boolean;
}

export interface RoomData {
	id: string;
	name?: string;
	currentPhase: PhaseData;
	selectedChamp: string;
	teams: {
		Blue: TeamData;
		Red: TeamData;
	};
	starting: boolean;
	started: boolean;
}
