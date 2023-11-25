import { v4 as uuidv4 } from 'uuid';
import { fail } from '@sveltejs/kit';

export const actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const roomNameField = data.get('roomName');

		if (!roomNameField) {
			return fail(400, {
				roomName: '',
				error: 'Room must have a name'
			});
		}

		const roomName = roomNameField.toString();

		if (roomName.length < 5) {
			return fail(400, {
				roomName: roomNameField,
				error: 'Room name must be longer than 4 characters.'
			});
		}

		return {
			room: {
				id: uuidv4(),
				name: roomName
			}
		};
	}
};
