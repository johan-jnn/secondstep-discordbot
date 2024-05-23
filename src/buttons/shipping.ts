import {
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChannelType,
	ThreadAutoArchiveDuration,
} from "discord.js";
import WTBClient from "../main.js";
import BotButton from "../utils/button.js";

export default class Shipping extends BotButton {
	constructor(client: WTBClient) {
		super(
			import.meta.filename,
			client,
			new ButtonBuilder()
				.setLabel("Shipping")
				.setStyle(ButtonStyle.Secondary)
				.setEmoji("📦")
				.setLabel("Shipping")
		);
	}

	async onClick(interaction: ButtonInteraction): Promise<any> {
		// It's the same behavior that the meetup system
		const meetup = this.client.getComponent("buttons", "meetup");
		if (!meetup)
			return interaction.reply({
				content:
					"Oups... Je n'ai pas trouvé la fonction pour ce bouton. Contactez l'administrateur/développeur du robot.",
				ephemeral: true,
			});
		const {onClick} = meetup;
		return onClick.bind(this)(interaction);
	}
}
