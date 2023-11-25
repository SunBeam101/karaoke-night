import { v4 as uuidv4 } from 'uuid';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ cookies }) => {
	const userId = cookies.get('userId');

	if (userId) {
		return {
			userId
		};
	}

	const uuid = uuidv4();

	cookies.set('userId', uuidv4(), { path: '/', secure: false });

	return { userId: uuid };
}) satisfies LayoutServerLoad;
