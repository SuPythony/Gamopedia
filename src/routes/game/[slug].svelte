<script lang="ts" context="module">
	/**
	 * @type {import('@sveltejs/kit').Load}
	 */
	export function load({ page }) {
		return {
			props: {
				slug: page.params.slug,
			},
		};
	}
</script>

<script lang="ts">
	import { onMount } from "svelte";
	import { showingGame, signedIn } from "$lib/stores";
	import { waitUntil } from "async-wait-until";

	import { Circle, Jumper, Moon } from "svelte-loading-spinners";
	import { goto } from "$app/navigation";

	interface gameInterface {
		id: number;
		summary: string;
		name: string;
		first_release_date: number;
		total_rating: number;
		total_rating_count: number;
		genres: {
			id: number;
			name: string;
		}[];
		involved_companies: {
			id: number;
			name: string;
			url: string;
			developer: boolean;
			publisher: boolean;
		}[];
		platforms: {
			id: number;
			name: string;
			url: string;
		}[];
		screenshots: {
			id: number;
			url: string;
		}[];
		videos: {
			id: number;
			name: string;
			video_id: string;
		}[];
		websites: {
			id: number;
			url: string;
		}[];
	}

	let loading = true;
	export let slug: string;
	let gameExists = true;
	let game: gameInterface = {
		id: 41825,
		first_release_date: 1498780800,
		genres: [
			{
				id: 12,
				name: "Role-playing (RPG)",
			},
			{
				id: 31,
				name: "Adventure",
			},
		],
		involved_companies: [
			{
				id: 70,
				name: "Nintendo",
				url: "https://www.igdb.com/companies/nintendo",
				developer: true,
				publisher: true,
			},
		],
		name: "The Legend of Zelda: Breath of the Wild - The Master Trials",
		platforms: [
			{
				id: 534,
				url: "//images.igdb.com/igdb/image/upload/t_thumb/pleu.jpg",
				name: "Nintendo Switch",
			},
		],
		screenshots: [
			{
				id: 106959,
				url: "//images.igdb.com/igdb/image/upload/t_thumb/cqozfhn78mvp5zkkopg0.jpg",
			},
			{
				id: 438054,
				url: "//images.igdb.com/igdb/image/upload/t_thumb/sc9e06.jpg",
			},
			{
				id: 438055,
				url: "//images.igdb.com/igdb/image/upload/t_thumb/sc9e07.jpg",
			},
			{
				id: 438056,
				url: "//images.igdb.com/igdb/image/upload/t_thumb/sc9e08.jpg",
			},
			{
				id: 438057,
				url: "//images.igdb.com/igdb/image/upload/t_thumb/sc9e09.jpg",
			},
			{
				id: 438058,
				url: "//images.igdb.com/igdb/image/upload/t_thumb/sc9e0a.jpg",
			},
			{
				id: 438059,
				url: "//images.igdb.com/igdb/image/upload/t_thumb/sc9e0b.jpg",
			},
			{
				id: 438060,
				url: "//images.igdb.com/igdb/image/upload/t_thumb/sc9e0c.jpg",
			},
			{
				id: 438061,
				url: "//images.igdb.com/igdb/image/upload/t_thumb/sc9e0d.jpg",
			},
		],
		summary:
			"DLC pack 1 cannot be purchased outside of the expansion pass. This first DLC pack for The Legend of Zelda: Breath of the wild doesn't include any story additions but does include new side quests, armour, features and a new trial.\nMaster mode is a new game mode which makes all monsters stronger and gives them regenerating health. You'll also encounter powerful new enemies, and even enemies and treasure chests up in the air.\nThe Trial of the Sword is a new challenge where you start with no equipment, and has to fight through 45 rooms of enemies. Your reward: powering up the Master Sword.\nHero's Path allows you to see the path you've travelled. About 200 hours of gameplay can be tracked.\nTravel medallion is a new item which allows you to register your location as a travel gate on the map.\nThe Korok Mask is Found in a chest. If equipped, it will shake to inform you when a Korok is nearby.\nThere are also eight hidden items for you to find. The following items, which pay tribute to The Legend of Zelda series, can now be found scattered across Hyrule: Majora's Mask, Midna's Helmet, Tingle's Hood, Tingle's Shirt, Tingle's Tights, Phantom Helmet, Phantom Armor and Phantom Greaves.",
		total_rating: 80.8298916277833,
		total_rating_count: 17,
		videos: [
			{
				id: 14794,
				name: "Trailer",
				video_id: "e93CP5QWNaA",
			},
		],
		websites: [
			{
				id: 50423,
				url: "http://www.zelda.com/breath-of-the-wild/news/expansion-pass-dlc-pack-1-detailed/",
			},
		],
	};
	let timeElapsed = 0;
	let Carousel;

	async function getData() {
		loading = true;
		const res: Response = await fetch(`/api/game-${slug}`);
		if (res.status === 404) {
			loading = false;
			gameExists = false;
			return;
		}
		const data = await res.json();
		game = data.game;
		loading = false;
	}

	onMount(async () => {
		await waitUntil(() => $signedIn !== undefined);
		if (!$signedIn) {
			goto("/signin");
		}
		showingGame.set(true);
		const module = await import("svelte-carousel");
		Carousel = module.default;
		getData();
		//loading = false;
		const t = setInterval(() => {
			timeElapsed++;
			if (timeElapsed > 15) {
				timeElapsed = 0;
			}
		}, 1000);
		return () => clearInterval(t);
	});
</script>

<svelte:head>
	{#if loading}
		<title>Loading...</title>
	{:else}
		<title>{game.name}</title>
	{/if}
</svelte:head>

{#if loading}
	<div id="loading-container">
		{#if timeElapsed < 5}
			<Circle size="3" unit="em" color="teal" />
		{:else if timeElapsed < 11}
			<Jumper color="teal" />
		{:else}
			<Moon size="3" unit="em" color="teal" />
		{/if}
	</div>
{:else if gameExists}
	<div id="main">
		<div id="container">
			<div id="vid-img">
				{#if game.videos.length + game.screenshots.length > 0}
					<svelte:component this={Carousel}>
						{#if game.videos && game.videos.length > 0}
							{#each game.videos as video}
								<iframe src="https://youtube.com/embed/{video.video_id}" title={video.name} />
							{/each}
						{/if}
						{#each game.screenshots as screenshot}
							<img
								draggable="false"
								src="https:{screenshot.url.replace('t_thumb', 't_screenshot_med')}"
								alt={game.name}
							/>
						{/each}
					</svelte:component>
				{/if}
				{#if game.genres && game.genres.length > 0}
					<div id="genres">
						{#each game.genres as genre}
							<div class="genre">
								<i class="fas fa-tag fa-sm" />
								<p>{genre.name}</p>
							</div>
						{/each}
					</div>
				{/if}
			</div>
			<div id="data">
				<h1>{game.name}</h1>
				<div id="no-2">
					{#if game.involved_companies && game.involved_companies.length > 0}
						<div id="dev-pub">
							{#if game.involved_companies.find((val) => val.developer)}
								<h2>
									Developed by: {@html game.involved_companies
										.filter((val) => val.developer)
										.map(
											(val) =>
												`<a style="color: lightblue;" href="${val.url}" target="_blank">${val.name}</a>`,
										)
										.join(", ")}
								</h2>
							{/if}
							{#if game.involved_companies.find((val) => val.publisher)}
								<h2>
									Published by: {@html game.involved_companies
										.filter((val) => val.publisher)
										.map(
											(val) =>
												`<a style="color: lightblue;" href="${val.url}" target="_blank">${val.name}</a>`,
										)
										.join(", ")}
								</h2>
							{/if}
						</div>
						{#if game.platforms && game.platforms.length > 0}
							<div id="platforms">
								{#each game.platforms as platform}
									<div id="platform">
										<img src="https:{platform.url}" alt={platform.name} />
										<h3>{platform.name}</h3>
									</div>
								{/each}
							</div>
						{/if}
					{/if}
				</div>
			</div>
		</div>
		{#if game.summary}
			<div id="container2">
				<div id="summary">
					<h4>{game.summary}</h4>
				</div>
				{#if game.websites && game.websites.length > 0}
					<div id="websites">
						<h2>{game.websites.length === 1 ? "Link" : "Links"}:</h2>
						<h3>
							{@html game.websites
								.map(
									(val) =>
										`<a style="color: lightblue;" target="_blank" href="${val.url}">${
											val.url.split("//")[1].split("/")[0]
										}</a>`,
								)
								.join(", ")}
						</h3>
					</div>
				{/if}
			</div>
		{/if}
	</div>
{:else}
	<div id="no-container">
		<h1>No such game</h1>
		<h2>Go to <a href="/games">Games</a> to find games you like</h2>
	</div>
{/if}

<style lang="scss">
	@import "../../lib/vars.scss";

	#main {
		display: flex;
		flex-direction: column;
		height: calc(100vh - 5em);
		justify-content: space-between;
		margin-top: 10px;
	}

	@media (min-width: $md) {
		#container2 {
			width: 100%;
			flex-grow: 1;
			color: white;
			display: flex;
			#summary {
				width: 60%;
				margin-left: 10px;
				padding-right: 10px;
				border-right: 2px solid teal;
			}
			#websites {
				margin-left: 10px;
			}
		}

		#data {
			display: flex;
			flex-direction: column;
			#no-2 {
				display: flex;
				#platforms {
					display: flex;
					margin-left: 20px;
					flex-wrap: wrap;
					#platform {
						display: flex;
						flex-direction: column;
						align-items: center;
						margin-right: 5px;
					}
				}
			}
		}

		#container {
			display: flex;
			color: white;
			#vid-img {
				width: 50%;
				height: calc(50vh - 5em);
				display: flex;
				flex-direction: column;
				height: fit-content;

				#genres {
					display: flex;
					justify-content: space-around;

					.genre {
						display: flex;
						align-items: center;
						gap: 5px;
						i,
						p {
							color: white;
							font-weight: bold;
						}
						padding-left: 3px;
						padding-right: 3px;
					}
				}
			}
		}
	}

	@media (min-width: $base) and (max-width: $md) {
		#main {
			margin-left: 5px;
		}

		#container {
			display: flex;
			flex-direction: column;
			color: white;
			font-size: 0.8em;
			#vid-img {
				#genres {
					display: flex;
					justify-content: space-around;

					.genre {
						display: flex;
						align-items: center;
						gap: 5px;
						font-size: 0.8em;
						i,
						p {
							color: white;
							font-weight: bold;
						}
						padding-left: 3px;
						padding-right: 3px;
					}
				}
			}
		}
		#container2 {
			color: white;
		}
	}

	#loading-container {
		display: flex;
		align-items: center;
		justify-content: center;
		height: calc(100vh - 6em);
	}

	#no-container {
		color: white;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: calc(100vh - 6em);
		a {
			color: teal;
		}
	}
</style>
