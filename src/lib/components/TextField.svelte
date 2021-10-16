<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let label: string;
	export let type = "text";
	export let required = false;
	export let width = "50%";
	export let height = "1.5em";
	export let borderColor = "white";
	export let backgroundColor = "transparent";
	export let textColor = "white";
	export let labelFontSize = "1.25em";
	export let inputFontSize = "1em";
	export let placeholder = "";
	export let value = "";

	const dispatch = createEventDispatcher();

	export let message = "";
	export let isValid = false;
	let validated = false;

	$: if (validated) {
		if (value === "") {
			isValid = false;
			message = `${label} is required`;
		} else if (!validateEmail(value) && type === "email") {
			isValid = false;
			message = "Invalid email";
		} else {
			isValid = true;
			message = "";
		}
	}

	function typeAction(node: HTMLInputElement) {
		node.type = type;
	}

	function validateEmail(email: string) {
		const re =
			/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	}

	export function submit() {
		validated = true;
		if (required && value === "") {
			isValid = false;
			message = `${label} is required`;
			return;
		}
		if (type === "email") {
			if (!validateEmail(value)) {
				isValid = false;
				message = "Invalid email";
				return;
			}
		}
		isValid = true;
		message = "";
	}
</script>

<div id="form-container" style="--text-color: {textColor};">
	<label for="field" style="font-size: {labelFontSize};">{label}</label><br />
	<input
		use:typeAction
		{required}
		{placeholder}
		id="field"
		style="width: {width}; height: {height}; font-size: {inputFontSize}; --border-color: {validated
			? isValid
				? 'rgb(73, 243, 73)'
				: '#fc8181'
			: borderColor}; background-color: {backgroundColor}"
		bind:value
	/>
	<p style="color: {isValid ? 'rgb(73, 243, 73)' : '#fc8181'};">{message}</p>
</div>

<style lang="scss">
	#form-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
	}

	input {
		outline: none;
		padding: 10px;
		border-radius: 10px;
		border: 2px var(--border-color) solid;
		color: var(--text-color);
		&:focus {
			border-color: #63b3ed;
		}
	}

	label {
		color: var(--text-color);
	}
</style>
