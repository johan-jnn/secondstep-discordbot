import {
	ChannelType,
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	type CacheType,
} from "discord.js";
import type WTBClient from "../main.js";
import BotCommand from "../utils/command.js";
import { isModerator } from "../utils/permissions.js";
import { getErrorMessage, getMember } from "../utils/getters.js";
import type WTBCreate from "../modals/wtb-create.js";

export default class WTB extends BotCommand {
	constructor(client: WTBClient) {
		super(
			import.meta.filename,
			client,
			//@ts-ignore - Don't know why the type is not reconised
			new SlashCommandBuilder()
				.setDescription("Poster un nouveau WTB")
				.addChannelOption((option) =>
					option
						.setRequired(false)
						.setName("channel")
						.setDescription(
							"Le salon où s'enverra le message (par défaut celui où a été exécuté la commande)."
						)
						.addChannelTypes(ChannelType.GuildText)
				)
		);
	}

	async onSent(
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<any> {
		const member = await getMember(interaction);
		if (!member) return;

		if (!isModerator(member, this.client.settings))
			return interaction.reply({
				content: "Tu n'es pas autorisé à exécuter cette commande.",
				ephemeral: true,
			});

		const channel =
			interaction.options.getChannel("channel") || interaction.channel;
		const send_on_channel = this.client.channels.cache.get(
			channel?.id || ""
		);
		if (send_on_channel?.type !== ChannelType.GuildText)
			return interaction.reply({
				content: getErrorMessage(
					"Le salon spécifié (ou le salon où a été envoyé la commande) n'est pas un salon valide pour la création d'un WTB !"
				),
				ephemeral: true,
			});

		this.client
			.getComponent("modals", "wtb-create")
			?.show(interaction, {
				send_on_channel,
			} satisfies WTBCreate["cache"])
			.catch((err) => {
				interaction.reply({
					content: getErrorMessage(
						"Je n'ai pas réussi à t'afficher le formulaire..."
					),
					ephemeral: true,
				});
				console.error(err);
			});
	}
}
