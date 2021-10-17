<script>
	import { getAuth, signOut } from "firebase/auth";
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { toast } from "@zerodevx/svelte-toast";
	import { waitUntil } from "async-wait-until";
	import { initializing, signedIn } from "$lib/stores";

	onMount(async () => {
		if (!$signedIn) {
			goto("/signin");
			return;
		}
		await waitUntil(() => $initializing === false);
		const auth = getAuth();
		signOut(auth)
			.then(() => {
				toast.push("Successfully signed out!", {
					theme: {
						"--toastBackground": "#48BB78",
						"--toastBarBackground": "#2F855A",
					},
				});
				goto("/");
			})
			.catch((err) => {
				toast.push("Something went wrong!", {
					theme: {
						"--toastBackground": "#F56565",
						"--toastBarBackground": "#C53030",
					},
				});
				goto("/");
			});
	});
</script>

<svelte:head>
	<title>Sign Out</title>
</svelte:head>
