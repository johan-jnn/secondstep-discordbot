import { StockxClient, StockxProduct } from "stockx-scraper";

const client = new StockxClient({
	countryCode: "FR",
	currencyCode: "EUR",
});

export async function getProduct(sku: string): Promise<StockxProduct | null> {
	return (
		(await client
			.search({
				query: sku,
			})
			.then((arr) => arr[0])
			.catch(() => null)) || null
	);
}
