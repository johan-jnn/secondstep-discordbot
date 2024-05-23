import type {
	ChatInputCommandInteraction,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	SlashCommandBuilder,
} from "discord.js";
import type WTBClient from "../main.js";
import path from "node:path";

export default class BotCommand {
	readonly informations: RESTPostAPIChatInputApplicationCommandsJSONBody;
	readonly client: WTBClient;
	constructor(
		__filename: string,
		client: WTBClient,
		informations: SlashCommandBuilder
	) {
		this.client = client;
		this.informations = informations
			.setName(path.parse(__filename).name)
			.toJSON();
	}

	async onSent(interaction: ChatInputCommandInteraction): Promise<any> {}
}
export class BotCommandElement extends BotCommand {
	//@ts-ignore
	constructor(client: WTBClient);
}
