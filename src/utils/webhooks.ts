import { readFileSync, existsSync, writeFile } from "node:fs";
import { join, parse } from "node:path";
const webhooksFile = join(parse(process.argv[1]).dir, "../webhooks.json");

var cache: string[] | null = null;

export function getWebhooks() {
	if (cache) return cache;
	if (!existsSync(webhooksFile)) return saveWebhooks([]);
	cache = JSON.parse(
		readFileSync(webhooksFile, { encoding: "utf8" })
	) as string[];
	return cache;
}

export function saveWebhooks<T extends string[]>(data: T): T {
	cache = data;
	writeFile(webhooksFile, JSON.stringify(data), (err) => {
		if (err) console.error(`Cannot save webhooks: ${err}`);
		else console.log(`Webhooks have been saved (size: ${data.length})`);
	});
	return data;
}

export function updateWebhooks<T>(mutator: (list: string[]) => T): T {
	const data = getWebhooks();
	const res = mutator(data);
	saveWebhooks(data)
	return res;
}
