<script lang="ts">
	import TextField from "$lib/components/TextField.svelte";
	import type { ActionCodeSettings } from "firebase/auth";
	import { sendSignInLinkToEmail, getAuth } from "firebase/auth";
	import { toast } from "@zerodevx/svelte-toast";
	import { Circle } from "svelte-loading-spinners";
	import { onMount } from "svelte";
	import { signedIn } from "$lib/stores";
	import { goto } from "$app/navigation";
	import { waitUntil } from "async-wait-until";
	import { showingGame } from "$lib/stores";

	let email: string;
	let loading = false;
	let emailField: TextField;
	let isValid: boolean;

	onMount(async () => {
		showingGame.set(false);
		await waitUntil(() => $signedIn !== undefined);
		if ($signedIn) {
			goto("/");
		}
	});

	function sendLink() {
		const actionCodeSettins: ActionCodeSettings = {
			url: `${window.location.href.includes("localhost") ? "http" : "https"}://${
				window.location.href.split("//")[1].split("/")[0]
			}/finishSignIn`,
			handleCodeInApp: true,
		};
		const auth = getAuth();
		sendSignInLinkToEmail(auth, email, actionCodeSettins)
			.then(() => {
				localStorage.setItem("signInEmail", email);
				toast.push("Link sent to your email!", {
					theme: {
						"--toastBackground": "#48BB78",
						"--toastBarBackground": "#2F855A",
					},
				});
				loading = false;
			})
			.catch((error) => {
				console.error(error.message);
				loading = false;
				toast.push("Something went wrong! Please try again.", {
					theme: {
						"--toastBackground": "#F56565",
						"--toastBarBackground": "#C53030",
					},
				});
			});
	}

	function handleSubmit() {
		if (!loading) {
			loading = true;
			emailField.submit();
			if (isValid) {
				sendLink();
			} else {
				loading = false;
			}
		}
	}
</script>

<svelte:head>
	<title>Sign In</title>
</svelte:head>

<form novalidate on:submit|preventDefault>
	<div>
		<TextField
			label="Email"
			type="email"
			bind:value={email}
			borderColor="teal"
			bind:this={emailField}
			required
			bind:isValid
			hint="You'll receive a link on your email, which you can use to sign in."
		/>
		<button on:click={handleSubmit}>
			{#if loading}
				<Circle color="white" size="1" unit="em" />
			{:else}
				Get Link
			{/if}
		</button>
	</div>
</form>

<style lang="scss">
	div {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		height: calc(100vh - 6em);
	}

	button {
		padding: 10px;
		padding-left: 20px;
		padding-right: 20px;
		border-radius: 5px;
		border: none;
		background-color: teal;
		color: white;
		&:hover {
			cursor: pointer;
		}
	}
</style>
