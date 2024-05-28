export type id = string;
export default interface Settings {
	moderators: {
		users: string[];
		roles: string[];
	};
	guild: {
		id: string;
		channels: {
			wtb: string;
		};
		categories: {
			closed_tickets: string;
		};
	};
}
