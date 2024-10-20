import type { ServerWebSocket } from 'bun';
import type { CurrentPhase, StartPhase } from './types/server';
import type { PhaseData } from './types/room';
import { rooms } from './data';

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
	remainingTime = 0;
	eta = 0;
	ended = false;
	ws: ServerWebSocket<unknown>;
	id: string;
	timerId?: Timer;
	constructor(ws: ServerWebSocket<unknown>, id: string) {
		this.ws = ws;
		this.id = id;
	}

	start = () => {
		this.startPhase();
	};

	startPhase = () => {
		const step = this.steps[this.currentStep];
		console.log(`Draft phase started: ${step.kind}-${step.team}-${step.order}`);
		this.stepStartTime = Date.now();
		this.eta = this.stepStartTime + 30 * 1000;
		this.currentStep++;
		const data: PhaseData = {
			kind: step.kind,
			team: step.team,
			order: step.order,
			eta: this.eta,
			paused: false,
		};
		const roomData = rooms.find((r) => r.id === this.id);
		if (roomData) {
			roomData.currentPhase = data;
			roomData.selectedChamp = '';
		}
		const payload: StartPhase = {
			command: 'StartPhase',
			...data,
		};
		this.ws.publish(this.id, JSON.stringify(payload));
		this.ws.send(JSON.stringify(payload));
		this.ws.publish(this.id, JSON.stringify(roomData));
		this.ws.send(JSON.stringify(roomData));
		if (this.currentStep === this.steps.length) {
			this.ended = true;
			return;
		}
		this.timerId = setTimeout(() => {
			this.pickSelectedChamp();
			this.startPhase();
		}, 30 * 1000);
	};

	pause = () => {
		const step = this.steps[this.currentStep - 1];
		console.log(`Draft phase paused: ${step.kind}-${step.team}-${step.order}`);
		clearTimeout(this.timerId);
		this.remainingTime = 30 * 1000 - (Date.now() - this.stepStartTime);
		this.paused = true;
		const payload: CurrentPhase = {
			command: 'CurrentPhase',
			kind: step.kind,
			team: step.team,
			order: step.order,
			eta: this.eta,
			paused: true,
		};
		this.ws.publish(this.id, JSON.stringify(payload));
		this.ws.send(JSON.stringify(payload));
	};

	resume = () => {
		if (this.paused) {
			const step = this.steps[this.currentStep - 1];
			console.log(`Draft phase resumed: ${step.kind}-${step.team}-${step.order}`);
			this.timerId = setTimeout(() => {
				this.pickSelectedChamp();
				this.startPhase();
			}, this.remainingTime);
			this.paused = false;
			this.eta = Date.now() + this.remainingTime;
			this.remainingTime = 0;
			const payload: CurrentPhase = {
				command: 'CurrentPhase',
				kind: step.kind,
				team: step.team,
				order: step.order,
				eta: this.eta,
				paused: false,
			};
			this.ws.publish(this.id, JSON.stringify(payload));
			this.ws.send(JSON.stringify(payload));
		}
	};

	forceNext = () => {
		clearTimeout(this.timerId);
		if (this.currentStep === this.steps.length) return;
		this.startPhase();
	};

	pickSelectedChamp = () => {
		const step = this.steps[this.currentStep - 1];
		const roomData = rooms.find((r) => r.id === this.id);
		if (roomData) {
			if (step.kind === 'Ban') {
				roomData.teams[step.team].bans[step.order - 1] = roomData.selectedChamp;
			} else {
				roomData.teams[step.team].players[step.order - 1].champ = roomData.selectedChamp;
			}
		}
	};
}
