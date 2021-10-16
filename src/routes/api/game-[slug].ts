import apiHeaders from "$lib/apiHeaders";
import fetch from "fetch-with-proxy";

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function get({ params }) {
	const url = "https://api.igdb.com/v4/games";
	const ans = await fetch(url, {
		method: "POST",
		headers: apiHeaders,
		body: `fields summary,name,first_release_date,total_rating,total_rating_count,genres,involved_companies,platforms,screenshots,videos,websites; where slug="${params.slug}";`,
	})
		.then((res) => res.json())
		.then((data) => data[0]);
	if (ans === undefined) {
		return {
			status: 404,
		};
	}
	const genres = [];
	if (ans.genres) {
		for (const genre of ans.genres) {
			genres.push(
				await fetch("https://api.igdb.com/v4/genres", {
					method: "POST",
					headers: apiHeaders,
					body: `fields name; where id=${genre};`,
				})
					.then((res) => res.json())
					.then((data) => data[0]),
			);
		}
	}
	const involved_companies = [];
	if (ans.involved_companies) {
		for (const company of ans.involved_companies) {
			const c = await fetch("https://api.igdb.com/v4/involved_companies", {
				method: "POST",
				headers: apiHeaders,
				body: `fields publisher,developer,company; where id=${company};`,
			})
				.then((res) => res.json())
				.then((data) => data[0]);
			involved_companies.push(
				await fetch("https://api.igdb.com/v4/companies", {
					method: "POST",
					headers: apiHeaders,
					body: `fields name,url; where id=${c.company};`,
				})
					.then((res) => res.json())
					.then((data) => {
						return { ...data[0], developer: c.developer, publisher: c.publisher };
					}),
			);
		}
	}
	const platforms = [];
	if (ans.platforms) {
		for (const platform of ans.platforms) {
			const p = await fetch("https://api.igdb.com/v4/platforms", {
				method: "POST",
				headers: apiHeaders,
				body: `fields name,platform_logo; where id=${platform};`,
			})
				.then((res) => res.json())
				.then((data) => data[0]);
			platforms.push(
				await fetch("https://api.igdb.com/v4/platform_logos", {
					method: "POST",
					headers: apiHeaders,
					body: `fields url; where id=${p.platform_logo};`,
				})
					.then((res) => res.json())
					.then((data) => {
						return { ...data[0], name: p.name };
					}),
			);
		}
	}
	const screenshots = [];
	if (ans.screenshots) {
		for (const screenshot of ans.screenshots) {
			screenshots.push(
				await fetch("https://api.igdb.com/v4/screenshots", {
					method: "POST",
					headers: apiHeaders,
					body: `fields url; where id=${screenshot};`,
				})
					.then((res) => res.json())
					.then((data) => data[0]),
			);
		}
	}
	const videos = [];
	if (ans.videos) {
		for (const video of ans.videos) {
			videos.push(
				await fetch("https://api.igdb.com/v4/game_videos", {
					method: "POST",
					headers: apiHeaders,
					body: `fields name,video_id; where id=${video};`,
				})
					.then((res) => res.json())
					.then((data) => data[0]),
			);
		}
	}
	const websites = [];
	if (ans.websites) {
		for (const website of ans.websites) {
			websites.push(
				await fetch("https://api.igdb.com/v4/websites", {
					method: "POST",
					headers: apiHeaders,
					body: `fields url; where id=${website};`,
				})
					.then((res) => res.json())
					.then((data) => data[0]),
			);
		}
	}
	return {
		body: {
			game: {
				...ans,
				genres,
				involved_companies,
				platforms,
				screenshots,
				videos,
				websites,
			},
		},
	};
}
