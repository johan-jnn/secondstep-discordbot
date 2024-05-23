import type WTBClient from "../main.js";
import path from "node:path";

export default class BotEvent {
	readonly name: string;
	readonly client: WTBClient;
	constructor(__filename: string, client: WTBClient) {
		this.name = path.parse(__filename).name;
		this.client = client;
	}
	async onTriggered(...parameters: any[]): Promise<any> {}
}

export class BotEventElement extends BotEvent {
	//@ts-ignore
	constructor(client: WTBClient);
}
