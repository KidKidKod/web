<script lang="ts">
	import { select_option } from "svelte/internal";

	import Board from "./Board.svelte";
	import Editor from "./Editor.svelte";
	import { run } from "./parser";

	const board = Array.from(Array(10), () => new Array(10));

	addEventListener("DOMContentLoaded", () => {
		const editor = document.getElementById("editor") as HTMLTextAreaElement;

		function sleep(ms: number) {
			console.log("Sleep", ms);
			return new Promise((resolve) => setTimeout(resolve, ms));
		}

		function color(i: number, j: number, v: number) {
			console.log(i, j, v);
			board[i][j] = v;
			return 0;
		}

		async function exec() {
			board.forEach((row) => row.fill(0));

			const prog = run(editor.value, {
				vars: {},
				funcs: { sleep, color },
			});

			console.log("Program Length:", prog.length);

			for (let e of prog) {
				console.log(e);
				await e.eval();
			}
		}

		editor.addEventListener("input", exec);
		editor.value = "color(0, 0, 1)";
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
