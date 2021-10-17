<script lang="ts" context="module">
	export async function load({ fetch }) {
		const res: Response = await fetch("/api/home-games");
		const data = await res.json();
		console.log(data);
		return {
			props: {
				games: data.games,
				covers: data.covers,
			},
		};
	}

	export const prerender = true;
</script>

<script lang="ts">
	import { onMount } from "svelte";
	import { signedIn } from "$lib/stores";
	import { waitUntil } from "async-wait-until";
	import { goto } from "$app/navigation";

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
	<title>Gameopedia</title>
</svelte:head>

{#if show}
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
					/>
					<h1>{game.name}</h1>
				</div>
			{/each}
		</svelte:component>
		<h3 id="s">Sign in to see more games and know more about them!</h3>
		<button on:click={() => goto("/signin")}>Sign In</button>
	</div>
{/if}

<style lang="scss">
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
	}

	#game {
		display: flex;
		flex-direction: column;
		align-items: center;
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
