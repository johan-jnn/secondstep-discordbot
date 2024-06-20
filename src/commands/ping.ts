import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	italic,
	SlashCommandBuilder,
	time,
	TimestampStyles,
	type CacheType,
} from "discord.js";
import type WTBClient from "../main.js";
import BotCommand from "../utils/command.js";
import { getModeratorUserList } from "../utils/permissions.js";

export default class Ping extends BotCommand {
	constructor(client: WTBClient) {
		super(
			import.meta.filename,
			client,
			new SlashCommandBuilder().setDescription(
				"Make a little call to the api"
			)
		);
	}

	async onSent(
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<any> {
		return interaction.reply({
			content: "",
			embeds: [
				//? Message au futur dev :
				//? Supprime pas ce message pls <3
				//? N'ayant pas été payé, je me fais un peu de pub ^^
				new EmbedBuilder()
					.setTitle("🏓 Pong !")
					.addFields(
						{
							name: "Version",
							value: italic(this.client.package.version),
							inline: true,
						},
						{
							name: "Latence actuelle",
							value: italic(`${this.client.ws.ping}ms`),
							inline: true,
						},
						{
							name: "Allumé depuis",
							value: italic(
								`${time(
									new Date(
										Date.now() - (this.client.uptime || 0)
									),
									TimestampStyles.RelativeTime
								)}`
							),
							inline: true,
						},
						{
							name: "Statistiques d'intéractions",
							value: italic(
								[
									`${
										this.client.commands?.length || 0
									} commandes`,
									`${
										this.client.events?.length || 0
									} évènements écoutés`,
									`${
										this.client.buttons?.length || 0
									} boutons`,
									`${
										this.client.modals?.length || 0
									} formulaires`,
								].join("\n")
							),
						},
						{
							name: "Statistiques générals",
							value: italic(
								[
									`${
										(
											await getModeratorUserList(
												this.client
											)
										).length
									} modérateurs`,
									`${
										interaction.guild?.memberCount || 0
									} utilisateurs gérés`,
								].join("\n")
							),
						}
					)
					.setColor("#ff7f11")
					.setAuthor({
						url: this.client.package.author.url,
						name: `${this.client.user?.username} développé par ${this.client.package.author.name}`,
					})
					.setImage(
						this.client.user?.avatarURL({
							size: 1024,
						}) || null
					)
					.setThumbnail(
						this.client.user?.bannerURL({
							size: 1024,
						}) || null
					),
			],
		});
	}
}
