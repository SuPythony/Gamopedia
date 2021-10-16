<script lang="ts">
	import firebaseConfig from "$lib/firebaseConfig";
	import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
	import { getAuth, onAuthStateChanged } from "firebase/auth";
	import { onMount } from "svelte";
	import { app, auth, signedIn, initializing } from "$lib/stores";
	import NavBar from "$lib/components/NavBar.svelte";
	import { SvelteToast } from "@zerodevx/svelte-toast";

	onMount(() => {
		$initializing = true;
		let fApp: FirebaseApp;
		if (getApps().length === 0) {
			fApp = initializeApp(firebaseConfig);
		} else {
			fApp = getApp();
		}
		const fAuth = getAuth(fApp);
		$app = fApp;
		$auth = fAuth;
		$initializing = false;
		onAuthStateChanged(fAuth, (user) => {
			if (user) {
				$signedIn = true;
			} else {
				$signedIn = false;
			}
		});
	});
</script>

<SvelteToast options={{ duration: 2000 }} />
<NavBar />
<slot />

<style>
	:global(body) {
		margin: 0px;
		background-color: #033d3d;
	}
</style>
