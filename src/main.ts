import { ButtonStyle, Client, REST, Routes } from "discord.js";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import BotCommand, { BotCommandElement } from "./utils/command.js";
import BotEvent from "./utils/event.js";
import type { BotEventElement } from "./utils/event.js";
import { pathToFileURL } from "node:url";
import "dotenv/config";
import BotModal from "./utils/modal.js";
import type { BotModalElement } from "./utils/modal.js";
import yaml from "yaml";
import type Settings from "../settings.js";
import pkg from "../package.json";

import BotButton, { BotButtonElement } from "./utils/button.js";

function listDir(dir: string) {
	const files = readdirSync(dir);
	return files.map((name) => pathToFileURL(path.join(dir, name)).toString());
}

export default class WTBClient extends Client {
	commands?: BotCommand[];
	events?: BotEvent[];
	modals?: BotModal[];
	buttons?: BotButton[];
	settings: Settings = yaml.parse(
		readFileSync(
			pathToFileURL(path.join(process.cwd(), "./settings.yaml")),
			{ encoding: "utf-8" }
		)
	);
	private isLogin = false;
	readonly package = pkg;
	constructor() {
		super({
			intents: ["Guilds", "GuildMembers", "GuildPresences"],
		});
	}

	private load<ModType>(dir: string) {
		return Promise.all(
			listDir(path.join(import.meta.dirname, dir)).map(
				(file) => import(file) as Promise<{ default: ModType }>
			)
		);
	}

	private getComponentIdentifier(
		component: BotCommand | BotEvent | BotModal | BotButton
	): string {
		if (component instanceof BotCommand) return component.informations.name;
		else if (component instanceof BotEvent) return component.name;
		else if (component instanceof BotModal)
			return component.informations.custom_id;
		else if (component instanceof BotButton)
			return component.informations.style === ButtonStyle.Link
				? component.informations.url
				: component.informations.custom_id;
		return "";
	}

	getComponent<
		Collection extends "commands" | "events" | "modals" | "buttons",
		R = Collection extends "commands"
			? BotCommand
			: Collection extends "events"
			? BotEvent
			: Collection extends "modals"
			? BotModal
			: Collection extends "buttons"
			? BotButton
			: never
	>(collection: Collection, handle: string): R | null {
		const collectionContent = this[collection];
		return (collectionContent?.find(
			(component) => this.getComponentIdentifier(component) === handle
		) || null) as R;
	}

	async login(token?: string) {
		if (this.isLogin) throw new Error("Bot is already login in.");

		token ??= process.env.TOKEN;
		if (!token) throw new Error("Invalid token provided.");

		await this.load<typeof BotCommandElement>("./commands").then((mod) => {
			this.commands = mod.map(
				({ default: Command }) => new Command(this)
			);
		});
		await this.load<typeof BotEventElement>("./events").then((mod) => {
			this.events = mod.map(({ default: Event }) => new Event(this));
		});
		await this.load<typeof BotModalElement>("./modals").then((mod) => {
			this.modals = mod.map(({ default: Modal }) => new Modal(this));
		});
		await this.load<typeof BotButtonElement>("./buttons").then((mod) => {
			this.buttons = mod.map(({ default: Button }) => new Button(this));
		});

		this.events?.forEach((event) => {
			this.on(event.name, (...args) => event.onTriggered(...args));
		});

		await super.login(token);

		if (this.commands?.length) {
			if (!this.application?.id)
				throw new Error("Invalid application ID after login in...");

			const rest = new REST().setToken(token);
			console.log(`Refreshing ${this.commands?.length} commmands...`);
			try {
				await rest.put(
					Routes.applicationGuildCommands(
						this.application.id,
						this.settings.guild.id
					),
					{
						body: this.commands.map((c) => c.informations),
					}
				);

				console.log("Commands have been refreshed.");
			} catch (err) {
				console.error(err);
			}
		}

		this.isLogin = true;
		return token;
	}
}

const client = new WTBClient();
console.log(client.settings);

client.login();
