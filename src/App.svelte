<script lang="ts">
	// https://github.com/antonmedv/codejar
	import { CodeJar } from "codejar";
	import Board from "./Board.svelte";
	import { getLexer, K, parse } from "./parser";

	const n = 16;
	const board = Array.from(Array(n), () => new Array(n));

	addEventListener("DOMContentLoaded", () => {
		const editor = document.getElementById("editor") as HTMLTextAreaElement;
		const lexer = getLexer(true);

		function sleep(ms: number) {
			console.log("Sleep", ms);
			return new Promise((resolve) => setTimeout(resolve, ms));
		}

		function color(i: number, j: number, v: number) {
			console.log(i, j, v);
			board[i][j] = v;
			return 0;
		}

		function token(text: string, kind: number) {
			if (kind === K.WS) {
				return document.createTextNode(text);
			} else {
				const e = document.createElement("t");
				e.innerText = text;
				e.setAttribute("kind", kind.toString());
				return e;
			}
		}

		const highlight = (editor: HTMLElement) => {
			const code = editor.textContent;
			const div = document.createElement("div");
			let tokens = lexer.parse(code);
			console.log(tokens);
			while (tokens) {
				div.appendChild(token(tokens.text, tokens.kind));
				tokens = tokens.next;
			}
			console.log(div);
			editor.innerHTML = div.innerHTML;
		};

		const jar = CodeJar(editor, highlight, {
			tab: "  ",
			indentOn: /.*:$/,
		});

		function exec(code: string) {
			console.log("executing", code);
			board.forEach((row) => row.fill(0));

			const prog = parse(code, {
				vars: {},
				funcs: { sleep, color },
			});

			prog.forEach((s) => s.eval());
		}

		jar.onUpdate(exec);
	});
</script>

<main>
	<div class="edit">
		<div id="editor" />
		<Board {board} />
	</div>
	<div class="colors">
		{#each [...Array(16).keys()] as i}
			<div data-color={i}>
				{i}
			</div>
		{/each}
	</div>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		width: 80em;
		margin: 2em auto;
	}

	.edit {
		display: flex;
		flex-direction: row;
	}

	#editor {
		flex-grow: 1;
		border: 1px solid #ccc;
		font-size: 16px;
		font-family: Consolas, monospace;
		line-height: 1.5;
		padding: 0.5em;
		margin: 0;
	}

	.colors {
		margin-top: 1em;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: stretch;
	}

	[data-color] {
		display: flex;
		height: 3em;
		flex-grow: 1;
		font-size: 2em;
		justify-content: center;
		align-items: center;
		color: white;
	}

	[data-color]:first-child {
		color: #333;
	}
</style>
