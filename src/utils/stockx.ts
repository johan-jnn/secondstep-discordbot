import { StockxClient, StockxProduct } from "stockx-scraper";

const client = new StockxClient({
	countryCode: "FR",
	currencyCode: "EUR",
});

export async function getProduct(
	sku: string,
	ttl = 3
): Promise<StockxProduct | null> {
	const res =
		(await client
			.search({
				query: sku,
			})
			.then((arr) =>
				arr.length ? arr[0] : "Empty returned product list."
			)
			.catch((err) => "" + err)) || null;
	if (typeof res === "string") {
		console.error(
			`---\nImpossible trouver le produit associé au SKU "${sku}":\n${res}\nNombre d'essais restant : ${ttl}.\n---`
		);
		if (ttl > 0) return getProduct(sku, ttl - 1);
		else return null;
	} else return res;
}
