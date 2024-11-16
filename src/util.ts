import type { Server } from 'bun';
import type { TeamCreationData } from './types/team';
import type { Lane } from './types/lol';
import type { Blankable } from './types/util';

export const parseCookie = (str: string) =>
	str
		.split(';')
		.map((v) => v.split('='))
		.reduce(
			(acc, v) => {
				acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
				return acc;
			},
			{} as { [index in string]?: string },
		);

export const generateRandomString = (charCount = 6): string => {
	const str = Math.random().toString(36).substring(2).slice(-charCount);
	return str.length < charCount ? str + 'a'.repeat(charCount - str.length) : str;
};

const Lanes = ['Top', 'Jungle', 'Mid', 'Bot', 'Support', ''] as const;
const compareLane = (lane1: Blankable<Lane>, lane2: Blankable<Lane>) => {
	if (Lanes.indexOf(lane1) < Lanes.indexOf(lane2)) return -1;
	if (Lanes.indexOf(lane1) > Lanes.indexOf(lane2)) return 1;
	return 0;
};

export const publishTeamInfo = (server: Server, teamData: TeamCreationData) => {
	teamData.Blue.sort((a, b) => {
		const laneCompResult = compareLane(a.lane, b.lane);
		if (laneCompResult === 0) {
			return a.name.localeCompare(b.name);
		}
		return laneCompResult;
	});
	teamData.Blue = teamData.Blue.filter((elem, index) => {
		return teamData.Blue.indexOf(elem) === index;
	});
	teamData.Red.sort((a, b) => {
		const laneCompResult = compareLane(a.lane, b.lane);
		if (laneCompResult === 0) {
			return a.name.localeCompare(b.name);
		}
		return laneCompResult;
	});
	teamData.Red = teamData.Red.filter((elem, index) => {
		return teamData.Red.indexOf(elem) === index;
	});
	teamData.Unassigned.sort((a, b) => {
		return a.name.localeCompare(b.name);
	});
	teamData.Unassigned = teamData.Unassigned.filter((elem, index) => {
		return teamData.Unassigned.indexOf(elem) === index;
	});
	const id = `team-${teamData.id}`;
	server.publish(id, JSON.stringify(teamData));
};
