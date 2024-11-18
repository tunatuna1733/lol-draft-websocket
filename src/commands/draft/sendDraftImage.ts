import { timers } from '../../data';
import type { DraftImageMessage } from '../../types/client';

type ImageBody = {
	id: string;
	image: string;
};

type ImageResponse = {
	success: boolean;
};

export const sendDraftImage = (data: DraftImageMessage) => {
	const timer = timers[data.roomID];
	if (!timer) {
		console.error('[SendDraftImage]Room not found.');
		return;
	}
	if (!timer.roomData.imageSent) {
		const url = 'https://akali.tunatuna.dev/draftImage';
		const body: ImageBody = {
			id: data.roomID,
			image: data.image,
		};
		fetch(url, { method: 'POST', body: JSON.stringify(body) }).then(async (res) => {
			const resJson: ImageResponse = await res.json();
			if (resJson.success) {
				timer.roomData.imageSent = true;
			}
		});
	}
};
