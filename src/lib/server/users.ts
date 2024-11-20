type UserId = string;
export type User = {
	id: string;
	name: string;
};

class UserManager {
	users: Map<UserId, User> = new Map();
	userNames: Set<string> = new Set();

	add(userId: UserId, user: User): User {
		if (!user.name) {
			throw Error('Name is required.');
		}

		if (this.userNames.has(user.name)) {
			throw Error('Username already exists. Please choose another one.');
		}

		this.users.set(userId, user);
		this.userNames.add(user.name);

		return user;
	}

	get(userId: UserId): User | null {
		const user = this.users.get(userId);

		if (!user) {
			return null;
		}

		return user;
	}

	delete(userId: string): void {
		const user = this.users.get(userId);

		if (!user) {
			throw Error(`User with id ${userId} does not exist and cannot be deleted.`);
		}

		this.userNames.delete(user.name);
		this.users.delete(userId);
	}
}

export class RoomGeneralManager {
	static rooms: Map<string, UserManager> = new Map();

	static getRoomManager(roomId: string) {
		const roomManager = this.rooms.get(roomId);

		if (roomManager) {
			return roomManager;
		}

		const newRoomManager = new UserManager();

		this.rooms.set(roomId, newRoomManager);

		return newRoomManager;
	}
}
