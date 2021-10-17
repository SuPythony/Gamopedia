<script lang="ts" context="module">
	let index = 0;
</script>

<script lang="ts">
	import { openedIndex } from "$lib/stores";
	import { slide } from "svelte/transition";
	import { keyClick } from "$lib/actions";

	const thisIndex = index++;
	let opened = false;

	$: if (thisIndex === $openedIndex) {
		opened = true;
	} else {
		opened = false;
	}

	export let title: string;
</script>

<div
	id="title"
	role="button"
	tabindex="0"
	use:keyClick={() => {
		if (opened) {
			$openedIndex = undefined;
		} else {
			$openedIndex = thisIndex;
		}
	}}
	on:click={() => {
		if (opened) {
			$openedIndex = undefined;
		} else {
			$openedIndex = thisIndex;
		}
	}}
>
	<h1>{title}</h1>
	<i class="fas fa-chevron-down fa-sm" style={opened ? "transform: rotate(180deg);" : ""} />
</div>
{#if opened}
	<div transition:slide id="content">
		<slot />
	</div>
{/if}

<style lang="scss">
	#title {
		background-color: rgba(59, 192, 192, 0.2);
		width: 100%;
		padding-left: 20px;
		padding-right: 20px;
		padding-top: 10px;
		padding-bottom: 10px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;
		h1 {
			margin: 0px;
		}
		&:hover {
			cursor: pointer;
		}
		i {
			transition: transform 500ms ease;
		}
	}

	#content {
		margin-bottom: 20px;
	}
</style>
