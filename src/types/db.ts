export type DraftRecord = {
	fearlessId: string;
	bans: {
		blue: string[];
		red: string[];
	};
	picks: {
		blue: string[];
		red: string[];
	};
	created: number;
};

export type SearchRequestData = {
	red: string[];
	blue: string[];
};
