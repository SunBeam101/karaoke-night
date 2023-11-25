import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, cookies }) => {
	const roomId = params.roomId;
	const userId = cookies.get('userId');

	if (userId !== roomId) {
		throw redirect(307, `/room/${params.roomId}/spectator`);
	}

	return {};
}) satisfies PageServerLoad;
