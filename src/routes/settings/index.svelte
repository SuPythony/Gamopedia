<svelte:head>
	<title>Settings</title>
</svelte:head>

<div id="container">
	<h1>Hello, {localStorage.getItem("name")}!</h1>
</div>

<style lang="scss">
	#container {
		display: flex;
		justify-content: center;
		color: white;
	}
</style>
