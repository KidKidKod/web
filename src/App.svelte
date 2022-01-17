<script lang="ts">
	// https://github.com/antonmedv/codejar
	import { CodeJar } from "codejar";
	import Board from "./Board.svelte";
	import { getLexer, K, KW_HEBREW, parse } from "./parser";

	const n = 16;
	const board = Array.from(Array(n), () => new Array(n));

	addEventListener("DOMContentLoaded", () => {
		const editor = document.getElementById("editor") as HTMLTextAreaElement;
		const lexer = getLexer(true, KW_HEBREW);

		function sleep(ms: number) {}

		function color(i: number, j: number, v: number) {
			console.log(i, j, v);
			if (0 <= i && i < n && 0 <= j && j < n) {
				board[i][j] = v;
			}
			return 0;
		}

		function token(text: string, kind: number) {
			if (kind === K.WS) {
				return document.createTextNode(text);
			} else {
				const e = document.createElement("t");
				e.innerText = text;
				const isKw = kind in [K.If, K.Each, K.From, K.To, K.End];
				e.setAttribute("kw", isKw ? "true" : "false");
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
			const host = {
				vars: {},
				funcs: {
					sleep,
					color,
					צבע: color,
					נמנם: sleep,
				},
			};
			const prog = parse(code, {
				host,
				lexer: getLexer(false, KW_HEBREW),
			});

			prog.forEach((s) => s.eval());
		}

		jar.onUpdate(exec);
		const code = `לכל שורה מ 0 עד 15:
  לכל עמודה מ 0 עד 15:
    צבע(שורה, עמודה, (שורה + עמודה) % 2)
  סוף
סוף`;
		jar.updateCode(code);
		exec(code);
	});
</script>

<main dir="rtl">
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
		margin-left: 1em;
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
