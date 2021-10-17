<script lang="ts">
	import { signedIn } from "$lib/stores";
	import { waitUntil } from "async-wait-until";
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import GameTile from "$lib/components/GameTile.svelte";
	import { Circle } from "svelte-loading-spinners";
	import { keyClick } from "$lib/actions";
	import { getFirestore, doc, getDoc } from "firebase/firestore";
	import { getAuth } from "firebase/auth";

	let offset = 0;
	let limit = 10;
	let gamesList = [];
	let coversList = [];
	let loading = true;

	async function getData() {
		loading = true;
		const docSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
		const wishlist = docSnap.data().wishlist;
		for (const wish of wishlist) {
			const res: Response = await fetch(`/api/wishlist-${wish}`);
			const data = await res.json();
			gamesList.push(data.game);
			coversList.push(data.cover);
		}
		loading = false;
	}

	let db;
	let auth;

	onMount(async () => {
		await waitUntil(() => $signedIn !== undefined);
		if (!$signedIn) {
			goto("/signin");
		} else {
			auth = getAuth();
			db = getFirestore();
			getData();
		}
	});
</script>

<svelte:head>
	<title>Wishlist</title>
</svelte:head>

<div id="container">
	<h1>Wishlist</h1>

	{#if loading}
		<Circle size="3" unit="em" color="teal" />
	{:else if gamesList.length === 0}
		<h2>No games in wishlist yet</h2>
		<h3>Go to <a href="/games">Games</a> to find games you like and add them to your wishlist</h3>
	{:else}
		<div id="game-tiles">
			{#each gamesList as game}
				<GameTile {game} cover={coversList.find((val) => val.id === game.cover)} />
			{/each}
		</div>
	{/if}
</div>

<style lang="scss">
	@import "../../lib/vars.scss";

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
	}
</style>
