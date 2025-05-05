import type { ServerWebSocket } from 'bun';
import { fearlessRecords } from './data';
import type { PhaseData, RoomData } from './types/room';
import type { CurrentPhase, StartPhase } from './types/server';

export class DraftTimer {
	steps = [
		{ kind: 'Ban', team: 'Blue', order: 1 },
		{ kind: 'Ban', team: 'Red', order: 1 },
		{ kind: 'Ban', team: 'Blue', order: 2 },
		{ kind: 'Ban', team: 'Red', order: 2 },
		{ kind: 'Ban', team: 'Blue', order: 3 },
		{ kind: 'Ban', team: 'Red', order: 3 },
		{ kind: 'Pick', team: 'Blue', order: 1 },
		{ kind: 'Pick', team: 'Red', order: 1 },
		{ kind: 'Pick', team: 'Red', order: 2 },
		{ kind: 'Pick', team: 'Blue', order: 2 },
		{ kind: 'Pick', team: 'Blue', order: 3 },
		{ kind: 'Pick', team: 'Red', order: 3 },
		{ kind: 'Ban', team: 'Red', order: 4 },
		{ kind: 'Ban', team: 'Blue', order: 4 },
		{ kind: 'Ban', team: 'Red', order: 5 },
		{ kind: 'Ban', team: 'Blue', order: 5 },
		{ kind: 'Pick', team: 'Red', order: 4 },
		{ kind: 'Pick', team: 'Blue', order: 4 },
		{ kind: 'Pick', team: 'Blue', order: 5 },
		{ kind: 'Pick', team: 'Red', order: 5 },
	] as const;
	currentStep = 0;
	stepStartTime = 0;
	paused = false;
	lastToggle = 0;
	remainingTime = 0;
	ws: ServerWebSocket<unknown>;
	roomData: RoomData;
	id: string;
	timerId?: Timer;
	constructor(ws: ServerWebSocket<unknown>, roomData: RoomData) {
		this.ws = ws;
		this.roomData = roomData;
		this.id = roomData.id;
	}

	start = () => {
		this.startPhase();
	};

	startPhase = () => {
		if (this.currentStep === this.steps.length) {
			this.roomData.ended = true;
			const fearlessId = this.roomData.fearlessId;
			const redChamps = this.roomData.teams.Red.players.map((p) => p.champ);
			const blueChamps = this.roomData.teams.Blue.players.map((p) => p.champ);
			fearlessRecords.push({
				created: Date.now(),
				red: redChamps,
				blue: blueChamps,
				fearlessId,
			});
			this.broadcast(JSON.stringify(this.roomData));
			return;
		}
		const step = this.steps[this.currentStep];
		this.stepStartTime = Date.now();
		this.remainingTime = 30 * 1000;
		const eta = this.stepStartTime + this.remainingTime;
		this.currentStep++;
		const data: PhaseData = {
			kind: step.kind,
			team: step.team,
			order: step.order,
			eta,
			remainingTime: this.remainingTime,
			paused: false,
		};
		this.roomData.currentPhase = data;
		this.roomData.selectedChamp = '';
		const payload: StartPhase = {
			command: 'StartPhase',
			...data,
		};
		this.broadcast(JSON.stringify(payload));
		this.broadcast(JSON.stringify(this.roomData));
		this.timerId = setTimeout(() => {
			this.pickSelectedChamp();
			this.startPhase();
		}, 30 * 1000);
	};

	pause = () => {
		if (Date.now() - this.lastToggle > 2 * 1000) {
			const step = this.steps[this.currentStep - 1];
			clearTimeout(this.timerId);
			this.remainingTime = this.remainingTime - (Date.now() - this.stepStartTime);
			this.paused = true;
			const payload: CurrentPhase = {
				command: 'CurrentPhase',
				kind: step.kind,
				team: step.team,
				order: step.order,
				eta: 0,
				remainingTime: this.remainingTime,
				paused: true,
			};
			this.broadcast(JSON.stringify(payload));
			this.lastToggle = Date.now();
			this.roomData.currentPhase.paused = true;
			this.roomData.currentPhase.remainingTime = this.remainingTime;
		}
	};

	resume = () => {
		if (this.paused && Date.now() - this.lastToggle > 2 * 1000) {
			const step = this.steps[this.currentStep - 1];
			this.timerId = setTimeout(() => {
				this.pickSelectedChamp();
				this.startPhase();
			}, this.remainingTime);
			this.paused = false;
			const eta = Date.now() + this.remainingTime;
			this.stepStartTime = Date.now();
			const payload: CurrentPhase = {
				command: 'CurrentPhase',
				kind: step.kind,
				team: step.team,
				order: step.order,
				eta,
				remainingTime: this.remainingTime,
				paused: false,
			};
			this.broadcast(JSON.stringify(payload));
			this.lastToggle = Date.now();
			this.roomData.currentPhase.paused = false;
			this.roomData.currentPhase.remainingTime = this.remainingTime;
		}
	};

	forceNext = () => {
		clearTimeout(this.timerId);
		this.startPhase();
	};

	pickSelectedChamp = () => {
		const step = this.steps[this.currentStep - 1];
		if (step.kind === 'Ban') {
			this.roomData.teams[step.team].bans[step.order - 1] = this.roomData.selectedChamp;
		} else {
			this.roomData.teams[step.team].players[step.order - 1].champ = this.roomData.selectedChamp;
		}
	};

	broadcast = (payload: string) => {
		this.ws.send(payload);
		this.ws.publish(this.roomData.id, payload);
	};
}
