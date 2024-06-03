import {
	APIButtonComponent,
	ButtonBuilder,
	ButtonInteraction,
} from "discord.js";
import WTBClient from "../main.js";
import path from "node:path";

export default class BotButton {
	readonly informations: APIButtonComponent;
	constructor(
		__filename: string,
		readonly client: WTBClient,
		button: ButtonBuilder
	) {
		this.informations = button
			.setCustomId(path.parse(__filename).name)
			.toJSON();
	}

	get component() {
		return new ButtonBuilder(this.informations);
	}
	async onClick(interaction: ButtonInteraction): Promise<any> {}
}

export class BotButtonElement extends BotButton {
	//@ts-ignore
	constructor(client: WTBClient);
}
