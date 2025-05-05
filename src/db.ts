import { MongoClient } from 'mongodb';
import type { Fearless } from './types/db';

const mongoURI = Bun.env.MONGO_URI || '';
const mongoClient = new MongoClient(mongoURI);
await mongoClient.connect();
const db = mongoClient.db('lol-bp').collection<Fearless>('fearless');
console.log('Initialized database');

export const getFearlessBans = async (id: string) => {
	if (!db) return;
	const result = await db.findOne({ id });
	return result;
};

export const insertFearlessBans = async (id: string, data: { red: string[]; blue: string[] }) => {
	if (!db) return false;
	try {
		await db.insertOne({
			fearlessID: id,
			red: data.red,
			blue: data.blue,
			created: Date.now(),
		});
		return true;
	} catch (_) {
		return false;
	}
};
