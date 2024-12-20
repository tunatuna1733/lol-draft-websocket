import { teams } from '../../data';
import type { CreateTeamPayload, TeamCreationData } from '../../types/team';
import { generateRandomString } from '../../util';

export const createTeam = (data: CreateTeamPayload) => {
	const id = generateRandomString();
	const teamCreationData: TeamCreationData = {
		id,
		createdTime: Date.now(),
		channelId: data.channelId,
		Blue: [],
		Red: [],
		Unassigned: data.players.map((p) => ({ ...p, lane: '' })),
		draftId: '',
	};
	teams.push(teamCreationData);
	return id;
};
