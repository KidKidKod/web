<script lang="ts">
	import Board from "./Board.svelte";
	import Editor from "./Editor.svelte";
	import { parse } from "./parser";

	const board = Array.from(Array(10), () => new Array(10));
	class Prog {
		reset() {
			board.forEach((row) => row.fill(0));
		}

		assign(x: number, y: number, value: number) {
			board[x][y] = value;
		}
	}
	const prog = new Prog();
	addEventListener("DOMContentLoaded", () => {
		console.log("DOMContentLoaded");
		const editor = document.getElementById("editor") as HTMLTextAreaElement;
		editor.addEventListener("input", () => {
			console.log(editor.value);
			parse(editor.value, prog);
		});
		editor.value = "board[0][0] = 4";
		parse(editor.value, prog);
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
