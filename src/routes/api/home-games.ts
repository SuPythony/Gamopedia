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
		body: "fields name,cover; offset 0; limit 10; where cover!=null & first_release_date > 1633026600; sort first_release_date asc;",
	})
		.then((res) => res.json())
		.then((data) => data);
	url = "https://api.igdb.com/v4/covers";
	const ans2 = await fetch(url, {
		method: "POST",
		headers: apiHeaders,
		body: `fields game,url; where id = (${ans.map((el) => el.cover).join(",")}); limit 500;`,
	})
		.then((res) => res.json())
		.then((data) => data);
	return {
		body: {
			games: ans,
			covers: ans2,
		},
	};
}
