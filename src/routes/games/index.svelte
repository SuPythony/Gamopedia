<script lang="ts">
	import { signedIn } from "$lib/stores";
	import { waitUntil } from "async-wait-until";
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import GameTile from "$lib/components/GameTile.svelte";
	import { Circle } from "svelte-loading-spinners";
	import { keyClick } from "$lib/actions";

	let offset = 0;
	let limit = 10;
	let gamesList = [];
	let coversList = [];
	let loading = true;
	let searchTerm = "";

	async function getData() {
		loading = true;
		const res: Response = await fetch(
			`/api/games-${offset}-${limit}-${searchTerm ? searchTerm : undefined}`,
		);
		const data = await res.json();
		gamesList = data.games;
		coversList = data.covers;
		loading = false;
	}

	onMount(async () => {
		await waitUntil(() => $signedIn !== undefined);
		if (!$signedIn) {
			goto("/signin");
		} else {
			getData();
		}
	});

	function search() {}
</script>

<svelte:head>
	<title>Games</title>
</svelte:head>

<div id="main">
	<div id="container">
		<h1>Games</h1>

		{#if loading}
			<Circle size="3" unit="em" color="teal" />
		{:else}
			<div id="game-tiles">
				{#each gamesList as game}
					<GameTile {game} cover={coversList.find((val) => val.id === game.cover)} />
				{/each}
			</div>
			<div id="pos">
				<i
					class="fas fa-chevron-left fa-sm"
					class:clickable={offset > 0}
					style="color: {offset === 0 ? 'grey' : 'white'};"
					role="button"
					tabIndex="0"
					use:keyClick={() => {
						if (offset > 0) {
							offset -= 10;
							getData();
						}
					}}
					on:click={() => {
						if (offset > 0) {
							offset -= 10;
							getData();
						}
					}}
				/>
				<p>Showing {offset + 1}-{offset + limit} games</p>
				<i
					class="fas fa-chevron-right fa-sm"
					class:clickable={!(gamesList.length < limit)}
					role="button"
					tabindex="0"
					use:keyClick={() => {
						if (!(gamesList.length < limit)) {
							offset += 10;
							getData();
						}
					}}
					on:click={() => {
						if (!(gamesList.length < limit)) {
							offset += 10;
							getData();
						}
					}}
				/>
			</div>
		{/if}
	</div>
	<div id="filters">
		<h1>Filters</h1>
		<div id="search">
			<form novalidate on:submit|preventDefault={search}>
				<input type="text" placeholder="Search" bind:value={searchTerm} />
				<button>Search</button>
			</form>
		</div>
	</div>
</div>

<style lang="scss">
	@import "../../lib/vars.scss";

	#filters {
		flex-grow: 1;
		height: fit-content;
		padding: 10px;
		display: flex;
		align-items: center;
		flex-direction: column;
		h1 {
			color: white;
		}
	}

	#main {
		display: flex;
		justify-content: flex-start;
	}

	#container {
		display: flex;
		color: white;
		flex-direction: column;
		align-items: center;
		@media (min-width: $base) {
			width: 100%;
		}
		@media (min-width: $md) {
			width: 75%;
		}
		h1 {
			font-size: 45px;
		}
		#game-tiles {
			align-self: flex-start;
			width: 100%;
		}
		#pos {
			display: flex;
			align-self: flex-start;
			align-items: center;
			justify-content: space-around;
			width: 100%;
			.clickable {
				&:hover {
					cursor: pointer;
				}
			}
		}
	}
</style>
