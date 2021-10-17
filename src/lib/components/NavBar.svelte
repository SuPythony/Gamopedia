<script lang="ts">
	import { slide } from "svelte/transition";
	import { keyClick } from "$lib/actions";
	import { signedIn } from "$lib/stores";
	import { onMount } from "svelte";
	import { initializing } from "$lib/stores";
	import { waitUntil } from "async-wait-until";
	import { getAuth } from "firebase/auth";

	let firestore;

	interface buttonInterface {
		text: string;
		submenus: boolean;
		clicked?: boolean;
		url?: string;
		submenuButtons?: {
			text: string;
			url: string;
		}[];
	}

	let buttons: buttonInterface[];

	$: buttons = [
		...($signedIn
			? [
					{
						text: "Games",
						submenus: false,
						url: "/games",
					},
			  ]
			: [
					{
						text: "Features",
						submenus: false,
						url: "#features",
					},
			  ]),
		...($signedIn
			? [
					{
						text: "Account",
						submenus: true,
						submenuButtons: [
							{
								text: "Wishlist",
								url: "/wishlist",
							},
							{
								text: "Feedback",
								url: "/feedback",
							},
						],
					},
			  ]
			: []),
		...($signedIn !== undefined
			? [
					{
						text: $signedIn ? "Sign Out" : "Sign In",
						submenus: false,
						url: $signedIn ? "/signout" : "/signin",
					},
			  ]
			: []),
	];

	let menuOpen = false;
	let gameOpen = false;
	let db;
	let auth;
	let inWishlist = undefined;
	let wishlist: string[] = [];
	let canCheck = false;
	$: if (canCheck && window.location.pathname.split("/")[1] !== "game") {
		inWishlist = undefined;
	}

	onMount(async () => {
		inWishlist = undefined;
		if (window.location.pathname.split("/")[1] === "game") {
			await waitUntil(() => $initializing === false);
			await waitUntil(() => $signedIn !== undefined);
			firestore = await import("firebase/firestore");
			if (signedIn) {
				gameOpen = true;
				auth = getAuth();
				db = firestore.getFirestore();
				const docRef = firestore.doc(db, "users", auth.currentUser.uid);
				const docSnap = await firestore.getDoc(docRef);
				if (docSnap.exists()) {
					wishlist = docSnap.data().wishlist;
					if (docSnap.data().wishlist.includes(window.location.pathname.split("/")[2])) {
						inWishlist = true;
					} else {
						inWishlist = false;
					}
				} else {
					firestore.setDoc(docRef, {
						wishlist: [],
					});
					inWishlist = false;
				}
			}
		}
		canCheck = true;
	});

	function removeAllClicks() {
		for (let button of buttons) {
			button.clicked = false;
		}
		buttons = buttons;
	}
</script>

<svelte:window
	on:click={() => {
		menuOpen = false;
		removeAllClicks();
	}}
/>

<div id="container">
	<div id="h-and-nav">
		<a id="heading" href={$signedIn ? "/games" : "/"}>Gamopedia</a>
		<div id="b-and-w">
			<div id="buttons">
				{#each buttons as button}
					<div>
						{#if button.url}
							<a class="button-container" tabindex="0" href={button.url}>
								<div class="nav-button">{button.text}</div>
							</a>
						{:else}
							<div
								class="button-container"
								tabindex="0"
								role="button"
								on:click|stopPropagation={() => {
									if (button.clicked) {
										removeAllClicks();
									} else {
										removeAllClicks();
										button.clicked = !button.clicked;
									}
								}}
								use:keyClick={() => {
									if (button.clicked) {
										removeAllClicks();
									} else {
										removeAllClicks();
										button.clicked = !button.clicked;
									}
								}}
							>
								<div class="nav-button">{button.text}</div>
								{#if button.submenus}
									<i
										class="fas fa-chevron-down fa-sm"
										style="transform: {button.clicked ? 'rotate(180deg)' : 'none'};"
									/>
								{/if}
							</div>
							{#if button.submenus && button.clicked}
								<div class="submenu-container" transition:slide>
									{#each button.submenuButtons as submenu}
										<a class="submenu" tabindex="0" href={submenu.url}>
											{submenu.text}
										</a>
									{/each}
								</div>
							{/if}
						{/if}
					</div>
				{/each}
			</div>
			{#if inWishlist === false}
				<div
					id="wish"
					tabindex="0"
					role="button"
					use:keyClick={async () => {
						wishlist.push(window.location.pathname.split("/")[2]);
						await firestore.updateDoc(firestore.doc(db, "users", auth.currentUser.uid), {
							wishlist,
						});
						inWishlist = true;
					}}
					on:click|stopPropagation={async () => {
						wishlist.push(window.location.pathname.split("/")[2]);
						await firestore.updateDoc(firestore.doc(db, "users", auth.currentUser.uid), {
							wishlist,
						});
						inWishlist = true;
					}}
				>
					<i class="far fa-bookmark fa-md" />
					<h2>Add to Wishlist</h2>
				</div>
			{:else if inWishlist === true}
				<div
					id="wish"
					tabindex="0"
					role="button"
					use:keyClick={async () => {
						await firestore.updateDoc(firestore.doc(db, "users", auth.currentUser.uid), {
							wishlist: wishlist.filter((val) => val !== window.location.pathname.split("/")[2]),
						});
						inWishlist = false;
					}}
					on:click|stopPropagation={async () => {
						await firestore.updateDoc(firestore.doc(db, "users", auth.currentUser.uid), {
							wishlist: wishlist.filter((val) => val !== window.location.pathname.split("/")[2]),
						});
						inWishlist = false;
					}}
				>
					<i class="fas fa-bookmark fa-md" />
					<h2>In your Wishlist</h2>
				</div>
			{/if}
			{#if !$signedIn}
				<img alt="Gamopedia Logo" src="/favicon.png" />
			{/if}
		</div>
	</div>

	<div id="menu-container">
		<div
			id="menu-button"
			role="navigation"
			tabindex="0"
			on:click|stopPropagation={() => {
				if (menuOpen) {
					removeAllClicks();
					menuOpen = false;
				} else {
					removeAllClicks();
					menuOpen = !menuOpen;
				}
			}}
			use:keyClick={() => {
				if (menuOpen) {
					removeAllClicks();
					menuOpen = false;
				} else {
					removeAllClicks();
					menuOpen = !menuOpen;
				}
			}}
		>
			<i class="fas {menuOpen ? 'fa-times' : 'fa-bars'} fa-lg" />
		</div>
		{#if menuOpen}
			<div id="menu" transition:slide>
				{#each buttons as button}
					{#if button.url}
						<a class="menu-button-container" tabindex="0" href={button.url}>
							<div class="nav-button">{button.text}</div>
						</a>
					{:else}
						<div>
							<div
								class="menu-button-container"
								tabindex="0"
								role="button"
								on:click|stopPropagation={() => {
									if (button.clicked) {
										removeAllClicks();
									} else {
										removeAllClicks();
										button.clicked = !button.clicked;
									}
								}}
								use:keyClick={() => {
									if (button.clicked) {
										removeAllClicks();
									} else {
										removeAllClicks();
										button.clicked = !button.clicked;
									}
								}}
							>
								<div class="nav-button">{button.text}</div>
								{#if button.submenus}
									<i
										class="fas fa-chevron-down fa-sm"
										style="transform: {button.clicked ? 'rotate(180deg)' : 'none'};"
									/>
								{/if}
							</div>
							{#if button.submenus && button.clicked}
								<div class="menu-submenu-container" transition:slide>
									{#each button.submenuButtons as submenu}
										<a class="menu-submenu" tabindex="0" href={submenu.url}>
											{submenu.text}
										</a>
									{/each}
								</div>
							{/if}
						</div>
					{/if}
				{/each}
				{#if inWishlist === false}
					<div
						id="menu-wish"
						tabindex="0"
						role="button"
						class="menu-button-container"
						use:keyClick={async () => {
							wishlist.push(window.location.pathname.split("/")[2]);
							await firestore.updateDoc(firestore.doc(db, "users", auth.currentUser.uid), {
								wishlist,
							});
							inWishlist = true;
						}}
						on:click|stopPropagation={async () => {
							wishlist.push(window.location.pathname.split("/")[2]);
							await firestore.updateDoc(firestore.doc(db, "users", auth.currentUser.uid), {
								wishlist,
							});
							inWishlist = true;
						}}
					>
						<h2 class="nav-button">Add to Wishlist</h2>
					</div>
				{:else if inWishlist}
					<div
						id="menu-wish"
						tabindex="0"
						role="button"
						class="menu-button-container"
						use:keyClick={async () => {
							await firestore.updateDoc(firestore.doc(db, "users", auth.currentUser.uid), {
								wishlist: wishlist.filter((val) => val !== window.location.pathname.split("/")[2]),
							});
							inWishlist = false;
						}}
						on:click|stopPropagation={async () => {
							await firestore.updateDoc(firestore.doc(db, "users", auth.currentUser.uid), {
								wishlist: wishlist.filter((val) => val !== window.location.pathname.split("/")[2]),
							});
							inWishlist = false;
						}}
					>
						<h2 class="nav-button">In your Wishlist</h2>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	@import "../vars.scss";

	img {
		height: 5em;
		align-self: center;
	}

	#wish {
		color: white;
		display: flex;
		align-items: center;
		border: 1px white solid;
		padding-left: 5px;
		padding-right: 5px;
		border-radius: 10px;
		height: min-content;
		align-self: center;
		background-color: transparent;
		margin-right: 10px;
		i {
			margin-right: 7px;
		}
		&:hover {
			cursor: pointer;
			color: teal;
			border-color: teal;
			background-color: white;
		}
	}

	a {
		text-decoration: none;
	}

	#b-and-w {
		justify-content: space-between;
		align-items: center;
		height: 100%;
		flex-grow: 1;
		@media (min-width: $base) {
			display: none;
		}

		@media (min-width: $md) {
			display: flex;
		}
	}

	#menu-container {
		@media (min-width: $base) {
			display: initial;
		}

		@media (min-width: $md) {
			display: none;
		}
		#menu-button {
			margin-right: 10px;
			&:hover {
				cursor: pointer;
			}
			i {
				color: $navbar-text;
			}
		}
		#menu {
			position: absolute;
			top: 5em;
			border-bottom-left-radius: 10px;
			border-bottom-right-radius: 10px;
			padding-top: 10px;
			display: flex;
			flex-direction: column;
			background-color: $navbar-bg;
			transform: translateX(-11em);
			width: fit-content;
			z-index: 1;
			#menu-wish {
				padding-top: initial;
				padding-bottom: initial;
			}
		}
		.menu-button-container {
			display: flex;
			align-items: center;
			justify-content: space-between;
			height: 100%;
			background-color: transparent;
			color: $navbar-text;
			margin-bottom: 10px;
			padding-top: 5px;
			padding-bottom: 5px;
			&:hover {
				background-color: $navbar-text;
				color: $navbar-bg;
				cursor: pointer;
			}
			i {
				margin-right: 10px;
				transition: 500ms ease;
				transition-property: transform;
			}
		}
		.menu-submenu-container {
			display: flex;
			flex-direction: column;
			.menu-submenu {
				display: flex;
				justify-content: center;
				font-size: 1.25em;
				color: $navbar-text;
				background-color: transparent;
				padding: 10px;
				&:hover {
					background-color: $navbar-text;
					color: $navbar-bg;
					cursor: pointer;
				}
			}
		}
	}

	#container {
		width: 100%;
		height: 5em;
		background-color: $navbar-bg;
		display: flex;
		align-items: center;
		justify-content: space-between;
		#heading {
			color: $navbar-text;
			margin-left: 10px;
			font-size: 2em;
			font-weight: bold;
			&:hover {
				cursor: pointer;
			}
		}
		#buttons {
			height: 100%;
			margin-left: 10px;
			display: flex;
		}
		#h-and-nav {
			display: flex;
			align-items: center;
			height: 100%;
			flex-grow: 1;
		}
	}

	.button-container {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 100%;
		border-radius: 5px;
		background-color: $navbar-bg;
		color: $navbar-text;
		&:hover {
			background-color: $navbar-text;
			color: $navbar-bg;
			cursor: pointer;
		}
		i {
			margin-right: 10px;
			transition: 500ms ease;
			transition-property: transform;
		}
	}

	.nav-button {
		font-size: 1.5em;
		color: inherit;
		font-weight: bold;
		margin-left: 10px;
		margin-right: 10px;
	}

	.submenu-container {
		display: flex;
		flex-direction: column;
		background-color: $navbar-bg;
		border-bottom-left-radius: 5px;
		border-bottom-right-radius: 5px;
		padding-top: 5px;
		position: relative;
		z-index: 1000;
		.submenu {
			display: flex;
			justify-content: center;
			font-size: 1.25em;
			color: $navbar-text;
			background-color: transparent;
			padding: 10px;
			margin-bottom: 5px;
			&:hover {
				background-color: $navbar-text;
				color: $navbar-bg;
				cursor: pointer;
			}
		}
	}
</style>
