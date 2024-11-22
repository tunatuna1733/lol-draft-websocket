import { timers } from '../../data';
import type { DraftImageMessage } from '../../types/client';

type ImageBody = {
	id: string;
	image: string;
	channelId?: string;
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
		};
		fetch(url, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }).then(
			async (res) => {
				const resJson: ImageResponse = await res.json();
				if (!resJson.success) {
					timer.roomData.imageSent = false;
				}
			},
		);
	}
};
