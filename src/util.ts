import type { Server } from 'bun';
import type { TeamCreationData } from './types/team';

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

export const publishTeamInfo = (server: Server, teamData: TeamCreationData) => {
	// TODO: sort, priority: lane, name
	const team = teamData;
	const id = `team-${teamData.id}`;
	server.publish(id, JSON.stringify(team));
};
