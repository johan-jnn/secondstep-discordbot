import "dotenv/config";
import path from "node:path";

function getTokens() {
	const key = process.env.STOCKX_API_KEY;
	const jtw = process.env.STOCKX_API_JTW;
	if (!(key && jtw))
		throw new Error(
			"Cannot access to the StockX API. No credentials set in the environement."
		);
	return { key, jtw };
}
function getHeader() {
	const { jtw, key } = getTokens();
	return {
		"x-api-key": key,
		Authorization: `Bearer ${jtw}`,
	};
}

export const API_VERSION = 2;
export const API_ROOT = `https://api.stockx.com/v${API_VERSION}/`;
export const endPoints = {
	product: (id: string) => path.join(API_ROOT, "/catalog/products/", id),
};
export async function getProduct(sku: string) {
	return fetch(endPoints.product(sku), {
		headers: getHeader(),
	})
		.then(async (res) => ({
			data: (await res.json()) as StockXProduct,
		}))
		.catch((err) => ({
			err,
		}));
}

export interface StockXProduct {
	productId: string;
	urlKey: string;
	styleId: string | null;
	productType: string;
	title: string | null;
	brand: string | null;
	productAttributes: {
		gender: string | null;
		season: string | null;
		releaseDate: string | null;
		retailPrice: number | null;
		colorway: string | null;
		color: string | null;
	};
}
