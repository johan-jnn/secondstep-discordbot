import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	type CacheType,
} from "discord.js";
import type WTBClient from "../main.js";
import BotCommand from "../utils/command.js";
import { getErrorMessage, getMember } from "../utils/getters.js";
import { isModerator } from "../utils/permissions.js";

export default class Kill extends BotCommand {
	constructor(client: WTBClient) {
		super(
			import.meta.filename,
			client,
			new SlashCommandBuilder()
				.setDescription("Deconnecte le robot d'urgence (nécessite un redémarrage sur le serveur)")
		);
	}

	async onSent(
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<any> {
    const member = await getMember(interaction);
		if (!member) return;

		if (!isModerator(member, this.client.settings))
			return interaction.reply({
				ephemeral: true,
				content: getErrorMessage(
					"Tu ne possèdes pas la permission d'exécuter cette commande."
				),
			});
    
    await interaction.reply({
      content: "Le robot sera innactif d'ici quelques instants"
    })
    console.log(`[${new Date().toString()}] Robot tué par ${member.user.tag} (id: ${member.id})`);
    this.client.destroy();
    process.abort();
	}
}
