export type id = string;
export default interface Settings {
	moderators: {
		users: string[];
		roles: string[];
	};
	guild: {
		id: string;
		channels: {
			buyers: string;
			closed_commands: string;
		};
	};
	wtb_webhooks: string[];
}
