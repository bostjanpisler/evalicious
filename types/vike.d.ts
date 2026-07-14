type AuthenticatedUser = {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image?: string | null;
	role: string;
};

declare global {
	namespace Vike {
		interface PageContext {
			user: AuthenticatedUser | null;
		}
	}
}

export {};
