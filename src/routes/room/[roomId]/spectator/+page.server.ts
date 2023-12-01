import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { RoomGeneralManager, type User } from '$lib/server/users';

export const load = (async ({ cookies, params }) => {
	const roomManager = RoomGeneralManager.getRoomManager(params.roomId);
	const currentUser = roomManager.get(cookies.get('userId') || '');

	return {
		user: currentUser,
	}
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ request, cookies, params }) => {
		const data = await request.formData();
		const roomManager = RoomGeneralManager.getRoomManager(params.roomId || '');

		const userId = cookies.get('userId') || '';
		const userName = data.get('userName');

		if (!userName) {
			return fail(400, { problem: 'Name is required.' });
		}

		const user: User = {
			id: userId,
			name: userName.toString(),
		}

		try {
			roomManager.add(userId, user);
		} catch (error) {
			// @ts-expect-error Later
			return fail(400, { problem: error.message as string });
		}
	}
} satisfies Actions;
