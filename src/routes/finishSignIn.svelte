<script>
	import { onMount } from "svelte";
	import { getAuth, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
	import { initializing } from "$lib/stores";
	import { toast } from "@zerodevx/svelte-toast";
	import TextField from "$lib/components/TextField.svelte";
	import { waitUntil } from "async-wait-until";
	import { Circle, Circle2 } from "svelte-loading-spinners";
	import { goto } from "$app/navigation";
	import { showingGame } from "$lib/stores";

	let signInFinished = false;
	let name = "";
	let nameField;
	let nameIsValid;
	let loading = false;
	let firestore;

	let db;
	let auth;

	onMount(async () => {
		showingGame.set(false);
		await waitUntil(() => $initializing === false);
		firestore = await import("firebase/firestore");
		auth = getAuth();
		if (isSignInWithEmailLink(auth, window.location.href)) {
			if (auth.currentUser) {
				goto("/");
			}
			db = firestore.getFirestore();
			let email = localStorage.getItem("signInEmail");
			if (!email) {
				email = window.prompt("Please provide your email for confirmation");
			}
			signInWithEmailLink(auth, email)
				.then(async (result) => {
					localStorage.removeItem("signInEmail");
					toast.push("Successfully signed in!", {
						theme: {
							"--toastBackground": "#48BB78",
							"--toastBarBackground": "#2F855A",
						},
					});
					const docRef = firestore.doc(db, "users", auth.currentUser.uid);
					const docSnap = await firestore.getDoc(docRef);
					if (docSnap.exists()) {
						localStorage.setItem("name", docSnap.data().name);
						goto("/");
					} else {
						signInFinished = true;
					}
				})
				.catch((error) => {
					console.error(error);
					goto("/signin");
					toast.push(
						`Something went wrong! ${
							localStorage.getItem("signInEmail") ? "" : "Did you enter the correct email?"
						}`,
						{
							theme: {
								"--toastBackground": "#F56565",
								"--toastBarBackground": "#C53030",
							},
						},
					);
				});
		} else {
			try {
				await waitUntil(() => auth.currentUser, { timeout: 1000 });
				goto("/");
			} catch {
				goto("/signin");
			}
		}
	});

	async function storeData() {
		localStorage.setItem("name", name);
		firestore
			.setDoc(firestore.doc(db, "users", auth.currentUser.uid), {
				name,
				wishlist: [],
			})
			.then(() => {
				loading = false;
				toast.push("Successfully saved!", {
					theme: {
						"--toastBackground": "#48BB78",
						"--toastBarBackground": "#2F855A",
					},
				});
				goto("/");
			})
			.catch((err) => {
				loading = false;
				toast.push("Something went wrong!", {
					theme: {
						"--toastBackground": "#F56565",
						"--toastBarBackground": "#C53030",
					},
				});
			});
	}

	async function handleSubmit() {
		if (!loading) {
			loading = true;
			nameField.submit();
			if (nameIsValid) {
				storeData();
			} else {
				loading = false;
			}
		}
	}
</script>

<svelte:head>
	<title>Finish Sign In</title>
</svelte:head>

<div>
	{#if !signInFinished}
		<Circle2 colorCenter="white" colorInner="teal" colorOuter="teal" />
	{:else}
		<TextField
			label="Name"
			type="text"
			placeholder="Enter your name"
			bind:value={name}
			borderColor="teal"
			bind:this={nameField}
			required
			bind:isValid={nameIsValid}
		/>
		<button on:click={handleSubmit}>
			{#if loading}
				<Circle color="white" size="1" unit="em" />
			{:else}
				Save
			{/if}
		</button>
	{/if}
</div>

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
