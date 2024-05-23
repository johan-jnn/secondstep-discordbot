import type WTBClient from "../main.js";
import BotEvent from "../utils/event.js";

export default class Ready extends BotEvent {
	constructor(client: WTBClient) {
		super(import.meta.filename, client);
	}

  async onTriggered(...parameters: any[]): Promise<any> {
    console.log("Bot is ready to use !");
    
  }
}
