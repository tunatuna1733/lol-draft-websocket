import type { ServerWebSocket } from 'bun';
import type { CurrentPhase, StartPhase } from './types/server';
import type { PhaseData, RoomData } from './types/room';

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
			this.broadcast(JSON.stringify(this.roomData));
			return;
		}
		const step = this.steps[this.currentStep];
		console.log(`Draft phase started: ${step.kind}-${step.team}-${step.order}`);
		this.stepStartTime = Date.now();
		const eta = this.stepStartTime + 30 * 1000;
		this.currentStep++;
		const data: PhaseData = {
			kind: step.kind,
			team: step.team,
			order: step.order,
			eta,
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
			eta: -1,
			paused: true,
		};
		this.broadcast(JSON.stringify(payload));
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
			const eta = Date.now() + this.remainingTime;
			this.remainingTime = 0;
			const payload: CurrentPhase = {
				command: 'CurrentPhase',
				kind: step.kind,
				team: step.team,
				order: step.order,
				eta,
				paused: false,
			};
			this.broadcast(JSON.stringify(payload));
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

	private broadcast = (payload: string) => {
		this.ws.send(payload);
		this.ws.publish(this.roomData.id, payload);
	};
}
