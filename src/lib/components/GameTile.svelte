<script lang="ts">
	import { currGame, currCover } from "$lib/stores";

	interface gameInterface {
		id: number;
		cover: number | undefined;
		name: string | undefined;
		first_release_date: number | undefined;
		total_rating: number | undefined;
		total_rating_count: number | undefined;
		summary: string | undefined;
		slug: string | undefined;
	}

	interface coverInterface {
		id: number;
		game: number;
		url: string;
	}

	export let game: gameInterface;
	export let cover: coverInterface;

	function shorten(s: string) {
		if (s.length > 130) {
			return s.slice(0, 127) + "...";
		}
		return s;
	}
</script>

<a href="/game/{game.slug}" target="_blank">
	<div id="container">
		<div id="cover">
			<img
				width="200"
				height="200"
				src="https:{cover.url.replace('t_thumb', 't_logo_med')}"
				alt={game.name}
			/>
		</div>
		<div id="data">
			<div id="title">
				<h2 id="name">{game.name}</h2>
			</div>
			{#if game.summary}
				<div id="summary">
					<p>{shorten(game.summary)}</p>
				</div>
			{/if}
			<div id="date-rating">
				{#if game.first_release_date}
					<p>
						Released on: {new Date(game.first_release_date * 1000).toLocaleString("en-US", {
							day: "numeric",
							month: "short",
							year: "numeric",
						})}
					</p>
				{/if}
				{#if game.total_rating && game.total_rating_count && game.total_rating_count !== 0}
					<p>
						Rating: {Math.round(game.total_rating)}% out of {game.total_rating_count}
						{game.total_rating_count === 1 ? "rating" : "ratings"}
					</p>
				{:else if game.total_rating}
					<p>Rating: {Math.round(game.total_rating)}%</p>
				{/if}
			</div>
		</div>
	</div>
</a>

<style lang="scss">
	@import "../vars.scss";

	#container {
		box-sizing: border-box;
		display: flex;
		background-color: teal;
		border-bottom: 2px #033d3d solid;
		padding: 10px;
		padding-bottom: 5px;
		width: 100%;
		transition: transform, margin-left 200ms ease;
		@media (min-width: $md) {
			&:hover,
			&:focus {
				cursor: pointer;
				transform: scale(1.05);
				margin-left: 40px;
			}
		}
	}

	i {
		align-self: center;
		margin-right: 10px;
		&:hover {
			cursor: pointer;
		}
	}

	#data {
		display: flex;
		flex-direction: column;
		width: 100%;
		margin-left: 10px;
	}

	#date-rating {
		align-self: flex-end;
	}

	#title {
		display: flex;
		justify-content: space-between;
	}

	@media (min-width: $base) {
		img {
			width: 130px;
			height: auto;
		}
		#container {
			font-size: 0.8em;
		}
	}

	@media (min-width: $md) {
		img {
			width: initial;
			height: initial;
		}
		#container {
			font-size: initial;
		}
	}

	a {
		color: white;
		text-decoration: none;
	}
</style>
