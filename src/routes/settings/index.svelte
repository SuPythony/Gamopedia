<script lang="ts">
	import { initializing } from "$lib/stores";
	import {
		getAuth,
		updateEmail,
		reauthenticateWithCredential,
		EmailAuthProvider,
	} from "firebase/auth";
	import TextField from "$lib/components/TextField.svelte";
	import { onMount } from "svelte";
	import { waitUntil } from "async-wait-until";
	import { Circle } from "svelte-loading-spinners";
	import { toast } from "@zerodevx/svelte-toast";

	let email = "";
	let emailField;
	let emailIsValid;
	let loading = false;
	let auth;

	onMount(async () => {
		await waitUntil(() => $initializing === false);
		auth = getAuth();
	});

	async function handleSubmit() {
		if (!loading) {
			loading = true;
			emailField.submit();
			if (emailIsValid) {
				const credential = EmailAuthProvider.credentialWithLink(email, localStorage.getItem("l"));
				reauthenticateWithCredential(auth.currentUser, credential)
					.then(() => {
						updateEmail(auth.currentUser, email)
							.then(() => {
								toast.push("Successfully changed email!", {
									theme: {
										"--toastBackground": "#48BB78",
										"--toastBarBackground": "#2F855A",
									},
								});
								loading = false;
							})
							.catch(() => {
								toast.push("Something went wrong!", {
									theme: {
										"--toastBackground": "#F56565",
										"--toastBarBackground": "#C53030",
									},
								});
								loading = false;
							});
					})
					.catch((e) => {
						console.log(e);
						toast.push("Something went wrong!", {
							theme: {
								"--toastBackground": "#F56565",
								"--toastBarBackground": "#C53030",
							},
						});
						loading = false;
					});
			} else {
				loading = false;
			}
		}
	}
</script>

<svelte:head>
	<title>Settings</title>
</svelte:head>

<div id="container">
	<h1>Hello, {localStorage.getItem("name")}!</h1>
	<TextField
		label="Change Email"
		type="email"
		placeholder="Enter new email"
		bind:value={email}
		borderColor="teal"
		bind:this={emailField}
		required
		bind:isValid={emailIsValid}
	/>
	<button on:click={handleSubmit}>
		{#if loading}
			<Circle color="white" size="1" unit="em" />
		{:else}
			Save
		{/if}
	</button>
</div>

<style lang="scss">
	#container {
		display: flex;
		justify-content: center;
		color: white;
	}
</style>
