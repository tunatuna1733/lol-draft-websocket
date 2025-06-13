import { type Collection, MongoClient, ServerApiVersion } from 'mongodb';
import type { DraftRecord } from './types/db';

export class MongoDBClient {
	client: MongoClient;
	draftRecords?: Collection<DraftRecord>;

	constructor() {
		const mongoURI = Bun.env.MONGO_URI || '';
		this.client = new MongoClient(mongoURI, {
			serverApi: {
				version: ServerApiVersion.v1,
				strict: true,
				deprecationErrors: true,
			},
		});
	}

	init = async () => {
		await this.client.connect();
		this.draftRecords = this.client.db('lol-bp').collection<DraftRecord>('draft');
	};

	getFearlessBans = async (fearlessId: string) => {
		if (!this.draftRecords) return;
		const result = await this.draftRecords.findOne({ fearlessId });
		return result;
	};

	getBans = async (picks: { red: string[]; blue: string[] }) => {
		if (!this.draftRecords) return;
		const docs = this.draftRecords.find();
		for await (const doc of docs) {
			if (
				doc.picks.red.every((a) => picks.red.some((b) => a === b)) &&
				doc.picks.red.length === picks.red.length &&
				doc.picks.blue.every((a) => picks.blue.some((b) => a === b)) &&
				doc.picks.blue.length === picks.blue.length
			) {
				return doc.bans;
			}
		}
	};

	insertDraftRecord = async (
		fearlessId: string,
		bans: { red: string[]; blue: string[] },
		picks: { red: string[]; blue: string[] },
	) => {
		if (!this.draftRecords) return false;
		try {
			await this.draftRecords.insertOne({
				fearlessId,
				bans,
				picks,
				created: Date.now(),
			});
			return true;
		} catch (_) {
			return false;
		}
	};
}
