import { Client, REST, Routes } from "discord.js";
import { readdirSync } from "node:fs";
import path from "node:path";
import BotCommand, { BotCommandElement } from "./utils/command";
import type BotEvent from "./utils/event";
import type { BotEventElement } from "./utils/event";
import { pathToFileURL } from "node:url";
import "dotenv/config";
import type BotModal from "./utils/modal";
import type { BotModalElement } from "./utils/modal";

function listDir(dir: string) {
	const files = readdirSync(dir);
	console.log(files);

	return files.map((name) => pathToFileURL(path.join(dir, name)).toString());
}

export default class WTBClient extends Client {
	commands?: BotCommand[];
	events?: BotEvent[];
	modals?: BotModal[];
	private isLogin = false;
	constructor() {
		super({
			intents: ["Guilds", "GuildMembers", "MessageContent"],
		});
	}

	private load<ModType>(dir: string) {
		return Promise.all(
			listDir(path.join(import.meta.dirname, dir)).map(
				(file) => import(file) as Promise<{ default: ModType }>
			)
		);
	}

	getModal(id: string) {
		const found = this.modals?.find(
			(modal) => modal.informations.custom_id === id
		);
		return found;
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
			this.modals = mod.map(({ default: Event }) => new Event(this));
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
					Routes.applicationCommands(this.application.id),
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
client.login();
