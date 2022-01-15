<script lang="ts">
	import Board from "./Board.svelte";
	import Editor from "./Editor.svelte";
	import { run } from "./parser";

	const board = Array.from(Array(10), () => new Array(10));

	addEventListener("DOMContentLoaded", () => {
		const editor = document.getElementById("editor") as HTMLTextAreaElement;

		function exec() {
			const [i, j, color] = run(editor.value);
			board[i][j] = color;
		}

		editor.addEventListener("input", exec);
		editor.value = "board[0, 0] = 4";
		exec();
	});
</script>

<main>
	<Editor />
	<Board {board} />
</main>

<style>
	main {
		display: flex;
		flex-direction: row;
	}
</style>
