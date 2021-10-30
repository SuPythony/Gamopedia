<script lang="ts">
	import TextField from "$lib/components/TextField.svelte";
	import type { ActionCodeSettings } from "firebase/auth";
	import {
		sendSignInLinkToEmail,
		getAuth,
		createUserWithEmailAndPassword,
		fetchSignInMethodsForEmail,
		signInWithEmailAndPassword,
	} from "firebase/auth";
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
	let showPasswordBox = false;
	let createAccount = false;
	let password: string;
	let isPasswordValid: boolean;
	let passwordMessage: string;
	let firestore;
	let userName: string;
	let nameIsValid: boolean;
	let passwordField: TextField;
	let emailMessage: string;
	let confirmPassword: string;
	let confirmPasswordMessage: string;
	let isConfirmPasswordValid: boolean;
	let confirmPasswordField: TextField;

	onMount(async () => {
		showingGame.set(false);
		await waitUntil(() => $signedIn !== undefined);
		if ($signedIn) {
			goto("/");
		} else {
			firestore = await import("firebase/firestore");
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
				toast.push("Link to sign in sent to your email!", {
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

	function continuePassword() {
		const auth = getAuth();
		fetchSignInMethodsForEmail(auth, email).then((res) => {
			loading = false;
			showPasswordBox = true;
			if (res.length === 0) {
				createAccount = true;
			} else {
				createAccount = false;
			}
		});
	}

	function handlePasswordlessSubmit() {
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

	function handlePasswordSubmit() {
		if (!loading) {
			loading = true;
			emailField.submit();
			if (isValid) {
				continuePassword();
			} else {
				loading = false;
			}
		}
	}

	function signIn() {
		if (!loading) {
			loading = true;
			const auth = getAuth();
			signInWithEmailAndPassword(auth, email, password)
				.then(async (res) => {
					loading = false;
					const db = firestore.getFirestore();
					const docRef = firestore.doc(db, "users", auth.currentUser.uid);
					const docSnap = await firestore.getDoc(docRef);
					if (docSnap.exists()) {
						localStorage.setItem("name", docSnap.data().name);
						goto("/");
						toast.push("Successfully signed in!", {
							theme: {
								"--toastBackground": "#48BB78",
								"--toastBarBackground": "#2F855A",
							},
						});
					}
				})
				.catch((e) => {
					loading = false;
					if (e.code === "auth/user-not-found" || e.code === "auth/wrong-password") {
						passwordMessage = "Invalid email or password";
					} else {
						toast.push("Something went wrong!.", {
							theme: {
								"--toastBackground": "#F56565",
								"--toastBarBackground": "#C53030",
							},
						});
					}
				});
		}
	}

	function register() {
		if (!loading) {
			loading = true;
			passwordField.submit();
			confirmPasswordField.submit();
			if (isPasswordValid && isConfirmPasswordValid) {
				if (password !== confirmPassword) {
					loading = false;
					isConfirmPasswordValid = false;
					confirmPasswordMessage = "Passwords don't match";
				}
			}
			if (isPasswordValid && isConfirmPasswordValid) {
				const auth = getAuth();
				createUserWithEmailAndPassword(auth, email, password)
					.then((res) => {
						const db = firestore.getFirestore();
						firestore
							.setDoc(firestore.doc(db, "users", auth.currentUser.uid), {
								name: userName,
								wishlist: [],
							})
							.then((res) => {
								localStorage.setItem("name", userName);
								goto("/");
								toast.push("Successfully signed in!", {
									theme: {
										"--toastBackground": "#48BB78",
										"--toastBarBackground": "#2F855A",
									},
								});
							})
							.catch((e) =>
								toast.push("Something went wrong!.", {
									theme: {
										"--toastBackground": "#F56565",
										"--toastBarBackground": "#C53030",
									},
								}),
							);
					})
					.catch((e) => {
						switch (e.code) {
							case "auth/email-already-in-use":
								emailMessage = "Email already in use";
								break;
							case "auth/weak-password":
								passwordMessage = "Weak password. Please make it strong.";
								break;
							default:
								toast.push("Something went wrong!.", {
									theme: {
										"--toastBackground": "#F56565",
										"--toastBarBackground": "#C53030",
									},
								});
								break;
						}
					});
			}
		}
	}
</script>

<svelte:head>
	<title>Sign In</title>
</svelte:head>

<form
	novalidate
	on:submit|preventDefault
	class:margins={createAccount}
	on:keydown={(e) => {
		if (!showPasswordBox && e.key === "Enter") {
			e.preventDefault();
		}
	}}
>
	<div id="form">
		<TextField
			label="Email"
			type="email"
			bind:value={email}
			borderColor="teal"
			bind:this={emailField}
			required
			bind:isValid
			bind:message={emailMessage}
		/>
		{#if showPasswordBox}
			{#if createAccount}
				<TextField
					label="Name"
					type="text"
					placeholder="Enter your name"
					bind:value={userName}
					borderColor="teal"
					required
					bind:isValid={nameIsValid}
				/>
			{/if}
			<TextField
				label="Password"
				type="password"
				bind:value={password}
				borderColor="teal"
				required
				bind:message={passwordMessage}
				bind:isValid={isPasswordValid}
				bind:this={passwordField}
			/>
			{#if createAccount}
				<TextField
					label="Confirm Password"
					type="password"
					bind:value={confirmPassword}
					borderColor="teal"
					required
					bind:message={confirmPasswordMessage}
					bind:isValid={isConfirmPasswordValid}
					bind:this={confirmPasswordField}
				/>
			{/if}
		{/if}
		{#if !showPasswordBox}
			<div id="buttons">
				<button on:click={handlePasswordlessSubmit}>
					{#if loading}
						<Circle color="white" size="1" unit="em" />
					{:else}
						Passwordless Sign In
					{/if}
				</button>
				<button on:click={handlePasswordSubmit}>
					{#if loading}
						<Circle color="white" size="1" unit="em" />
					{:else}
						Sign In with Password
					{/if}
				</button>
			</div>
		{:else if createAccount}
			<button on:click={register}>
				{#if loading}
					<Circle color="white" size="1" unit="em" />
				{:else}
					Register
				{/if}
			</button>
		{:else}
			<button on:click={signIn}>
				{#if loading}
					<Circle color="white" size="1" unit="em" />
				{:else}
					Sign In
				{/if}
			</button>
		{/if}
	</div>
</form>

<style lang="scss">
	#buttons {
		display: flex;
		gap: 1.5em;
	}

	#form {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		height: calc(100vh - 6em);
	}

	.margins {
		margin-top: 5em;
		margin-bottom: 3em;
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
