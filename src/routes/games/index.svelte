<script lang="ts">
	import { signedIn } from "$lib/stores";
	import { waitUntil } from "async-wait-until";
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import GameTile from "$lib/components/GameTile.svelte";
	import { Circle } from "svelte-loading-spinners";
	import { keyClick } from "$lib/actions";
	import { slide } from "svelte/transition";

	let offset = 0;
	let limit = 10;
	let gamesList = [];
	let coversList = [];
	let loading = true;
	let searchTerm = "";
	let after = 2000;
	let before = 2023;
	let showFilter = false;

	async function getData() {
		loading = true;
		const res: Response = await fetch(
			`/api/games-${offset}-${limit}-${
				searchTerm ? searchTerm : "noSearchTermHere"
			}-${after}-${before}`,
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

	function search() {
		getData();
	}
</script>

<svelte:head>
	<title>Games</title>
</svelte:head>

<div id="filter-button" role="button" tabindex="0" on:click={() => (showFilter = !showFilter)}>
	<h1>Advanced Search</h1>
</div>
{#if showFilter}
	<div id="mobile-filter" transition:slide>
		<div id="search">
			<form novalidate on:submit|preventDefault={search}>
				<input id="search-input" type="text" placeholder="Search" bind:value={searchTerm} />
				<button id="search-button">Search</button>
			</form>
		</div>
		<div id="date">
			<p>Released:</p>
			<label>
				After:
				<input id="search-input" type="number" min="1958" max="2023" bind:value={after} />
			</label>
			<label>
				Before:
				<input id="search-input" type="number" min="1958" max="2023" bind:value={before} />
			</label>
		</div>
	</div>
{/if}
<div id="main">
	<div id="container">
		<h1>Games</h1>

		{#if loading}
			<Circle size="3" unit="em" color="teal" />
		{:else if gamesList.length > 0}
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
				<p>
					Showing {offset + 1}-{gamesList.length < limit
						? offset + gamesList.length
						: offset + limit} games
				</p>
				<i
					class="fas fa-chevron-right fa-sm"
					class:clickable={!(gamesList.length < limit)}
					style="color: {gamesList.length < limit ? 'grey' : 'white'};"
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
		{:else}
			<h2>No games match your search</h2>
		{/if}
	</div>
	<div id="filters">
		<h1>Advanced Search</h1>
		<form novalidate on:submit|preventDefault={search}>
			<div id="search">
				<input id="search-input" type="text" placeholder="Search" bind:value={searchTerm} />
				<button id="search-button">Search</button>
			</div>
			<div id="date">
				<p>Released:</p>
				<label>
					After:
					<input id="search-input" type="number" min="1958" max="2023" bind:value={after} />
				</label>
				<label>
					Before:
					<input id="search-input" type="number" min="1958" max="2023" bind:value={before} />
				</label>
			</div>
		</form>
	</div>
</div>

<style lang="scss">
	@import "../../lib/vars.scss";

	#filter-button {
		color: white;
		display: flex;
		align-items: center;
		background-color: teal;
		margin-top: 10px;
		flex-direction: column;
		h1 {
			font-size: 1.5em;
		}
		@media (min-width: $base) {
			display: flex;
		}
		@media (min-width: $md) {
			display: none;
		}
	}

	#date {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		p {
			color: white;
			margin-top: 15px;
			margin-bottom: 0px;
			font-weight: bold;
		}
	}

	label {
		color: white;
	}

	#search-button {
		padding: 10px;
		border-radius: 10px;
		background-color: teal;
		color: white;
		outline: none;
		border: none;
		font-size: 0.8em;
		&:hover {
			background-color: white;
			color: teal;
			cursor: pointer;
		}
	}

	#search-input {
		padding: 10px;
		border-radius: 10px;
		outline: none;
		border: 2px teal solid;
		font-size: 0.8em;
		margin-top: 2em;
	}

	#filters {
		flex-grow: 1;
		height: fit-content;
		padding: 10px;
		align-items: center;
		flex-direction: column;
		@media (min-width: $base) {
			display: none;
		}
		@media (min-width: $md) {
			display: flex;
		}
		h1 {
			color: white;
		}
	}

	#mobile-filter {
		padding: 10px;
		align-items: center;
		flex-direction: column;
		align-items: center;
		h1 {
			color: white;
		}
		@media (min-width: $base) {
			display: flex;
		}
		@media (min-width: $md) {
			display: none;
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
