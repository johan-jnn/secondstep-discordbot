import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	type CacheType,
} from "discord.js";
import type WTBClient from "../main.js";
import BotCommand from "../utils/command.js";

export default class Ping extends BotCommand {
	constructor(client: WTBClient) {
		super(
			import.meta.filename,
			client,
			new SlashCommandBuilder()
				.setDescription("Make a little call to the api")
		);
	}

	async onSent(
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<any> {
		interaction.reply("Pong !");
	}
}
