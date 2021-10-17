import apiHeaders from "$lib/apiHeaders";
import fetch from "fetch-with-proxy";

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function get({ params }) {
	let url = "https://api.igdb.com/v4/games";
	const ans = await fetch(url, {
		method: "POST",
		headers: apiHeaders,
		body: `fields summary,slug,cover,name,first_release_date,total_rating,total_rating_count; where slug="${params.slug}";`,
	})
		.then((res) => res.json())
		.then((data) => data[0]);
	url = "https://api.igdb.com/v4/covers";
	const ans2 = await fetch(url, {
		method: "POST",
		headers: apiHeaders,
		body: `fields game,url; where id=${ans.cover};`,
	})
		.then((res) => res.json())
		.then((data) => data[0]);
	return {
		body: {
			game: ans,
			cover: ans2,
		},
	};
}
