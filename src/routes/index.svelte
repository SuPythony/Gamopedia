<script>
	import { onMount } from "svelte";
	import { signedIn } from "$lib/stores";
	import { waitUntil } from "async-wait-until";
	import { goto } from "$app/navigation";

	onMount(async () => {
		await waitUntil(() => $signedIn !== undefined);
		if ($signedIn) {
			goto("/games");
		}
	});
</script>
