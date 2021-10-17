<script lang="ts" context="module">
	export async function load({ fetch }) {
		const res: Response = await fetch("/api/home-games");
		const data = await res.json();
		return {
			props: {
				games: data.games,
				covers: data.covers,
			},
		};
	}
</script>

<script lang="ts">
	import { onMount } from "svelte";
	import { signedIn } from "$lib/stores";
	import { waitUntil } from "async-wait-until";
	import { goto } from "$app/navigation";
	import Accordion from "$lib/components/Accordion.svelte";
	import AccordionItem from "$lib/components/AccordionItem.svelte";
	import { showingGame } from "$lib/stores";

	interface gameInterface {
		id: number;
		name: string;
		cover: string;
	}

	let show = false;
	export let games: gameInterface[];
	export let covers;
	let Carousel;

	onMount(async () => {
		showingGame.set(false);
		await waitUntil(() => $signedIn !== undefined);
		if ($signedIn) {
			goto("/games");
		}
		const module = await import("svelte-carousel");
		Carousel = module.default;
		show = true;
	});
</script>

<svelte:head>
	<title>Gamopedia</title>
</svelte:head>

{#if show}
	<div id="main">
		<div id="container">
			<h1>Welcome to Gamopedia!</h1>
			<h3>An encyclopedia of video games</h3>
			<h3>Some of the latest games -</h3>
			<svelte:component this={Carousel}>
				{#each games as game}
					<div id="game">
						<img
							alt="{game.name}'s cover"
							src="https:{covers
								.find((val) => val.id === game.cover)
								.url.replace('t_thumb', 't_cover_big')}"
							style="margin-top: 1em;"
						/>
						<h1 id="game-name">{game.name}</h1>
					</div>
				{/each}
			</svelte:component>
			<h3 id="s">Sign in to see more games and know about them!</h3>
			<button on:click={() => goto("/signin")}>Sign In</button>
		</div>
		<hr />
		<div id="features">
			<h1>Features</h1>
			<Accordion>
				<AccordionItem title="Trusted Data">
					<h3 class="accordion-item">
						All game data is collected from Internet's largest video game database - <a
							href="https://igdb.com">IGDB</a
						>
					</h3>
				</AccordionItem>
				<AccordionItem title="Responsiveness">
					<h3 class="accordion-item">
						Gamopedia is fully responsive allowing you to have the full experience on any device,
						anytime, anywhere.
					</h3>
				</AccordionItem>
				<AccordionItem title="Wishlist">
					<h3 class="accordion-item">
						You can store games you plan of playing or buying later in your wishlist which is stored
						in the cloud and can be accessed anywhere.
					</h3>
				</AccordionItem>
			</Accordion>
		</div>
	</div>
{/if}

<style lang="scss">
	.accordion-item {
		text-align: center;
	}

	#main {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	#features {
		color: white;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 20px;
		width: 50%;
		h1 {
			margin-top: 0em;
			font-size: 3em;
		}
	}

	hr {
		border: 1px solid teal;
		margin-top: 1.2em;
		margin-bottom: 1em;
		width: 75%;
	}

	#game-name {
		color: palevioletred;
	}

	button {
		background-color: teal;
		color: white;
		padding: 10px;
		border: none;
		border-radius: 10px;
		font-size: 1.2em;
		margin-top: -2em;
		&:hover {
			background-color: white;
			color: teal;
			cursor: pointer;
		}
	}

	#s {
		margin-top: 2em;
		text-align: center;
	}

	#game {
		display: flex;
		flex-direction: column;
		align-items: center;
		background-image: url("/home-bg.jpg");
		background-repeat: no-repeat;
		background-position: center;
		background-size: cover;
		justify-content: center;
	}

	#container {
		color: white;
		display: flex;
		width: 100%;
		flex-direction: column;
		align-items: center;
		h1 {
			font-size: 3em;
			text-align: center;
		}
		h3 {
			font-size: 1.5em;
			position: relative;
			top: -1.5em;
		}
	}
</style>
