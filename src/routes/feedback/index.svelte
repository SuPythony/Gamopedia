<script>
	import { signedIn } from "$lib/stores";
	import { waitUntil } from "async-wait-until";
	import { onMount } from "svelte";
	import TextField from "$lib/components/TextField.svelte";
	import { Circle } from "svelte-loading-spinners";
	import { toast } from "@zerodevx/svelte-toast";
	import { getAuth } from "firebase/auth";
	import { goto } from "$app/navigation";
	import { showingGame } from "$lib/stores";

	let db;
	let auth;
	let feedback = "";
	let feedbackField;
	let isValid = false;
	let loading = false;
	let validated = false;
	let firestore;

	onMount(async () => {
		showingGame.set(false);
		await waitUntil(() => $signedIn !== undefined);
		firestore = await import("firebase/firestore");
		db = firestore.getFirestore();
		auth = getAuth();
		if (!$signedIn) {
			goto("/signin");
		}
	});

	function handleSubmit() {
		if (!loading) {
			loading = true;
			feedbackField.submit();
			if (isValid) {
				firestore
					.setDoc(firestore.doc(db, "feedback", auth.currentUser.uid), {
						name: localStorage.getItem("name"),
						feedback,
					})
					.then(() => {
						feedback = "";
						validated = false;
						toast.push("Feedback Sent!", {
							theme: {
								"--toastBackground": "#48BB78",
								"--toastBarBackground": "#2F855A",
							},
						});
						loading = false;
					})
					.catch(() => {
						toast.push("Something went wrong! Please try again.", {
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
	<title>Feedback</title>
</svelte:head>

<div id="container">
	<h1>Hello, {localStorage.getItem("name")}!</h1>

	<div id="feedback-form">
		<form on:submit|preventDefault novalidate>
			<TextField
				label="Feedback"
				type="textarea"
				bind:value={feedback}
				borderColor="teal"
				bind:this={feedbackField}
				required
				bind:isValid
				bind:validated
			/>
			<button on:click={handleSubmit}>
				{#if loading}
					<Circle color="white" size="1" unit="em" />
				{:else}
					Send Feedback
				{/if}
			</button>
		</form>
	</div>
</div>

<style lang="scss">
	#feedback-form {
		width: 100%;
		form {
			width: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;
		}
		button {
			margin-top: -2em;
			padding: 10px;
			font-size: 1em;
			color: white;
			background-color: teal;
			border: none;
			border-radius: 10px;
			&:hover {
				color: teal;
				background-color: white;
				cursor: pointer;
			}
		}
	}

	#container {
		display: flex;
		align-items: center;
		color: white;
		flex-direction: column;
	}
</style>
