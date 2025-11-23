import { timers } from '../../data';
import type { DraftImageMessage } from '../../types/client';

type ImageBody = {
	id: string;
	image: string;
	channelId?: string;
	fearlessId: string;
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
		timer.roomData.imageSent = true;
		const url = `${process.env.IMAGE_ENDPOINT}/draftImage`;
		const body: ImageBody = {
			id: data.roomID,
			image: data.image,
			channelId: data.channelId,
			fearlessId: data.fearlessId,
		};
		try {
			fetch(url, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }).then(
				async (res) => {
					console.log(res);
					const resJson: ImageResponse = await res.json();
					console.log(resJson);
					if (!resJson.success) {
						timer.roomData.imageSent = false;
					}
				},
			);
		} catch (error) {
			console.error('[SendDraftImage]Failed to send draft image:', error);
			timer.roomData.imageSent = false;
		}
	}
};
