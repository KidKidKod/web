<script lang="ts">
	// https://github.com/antonmedv/codejar
	import type { Octokit } from "octokit";
	import { CodeJar } from "codejar";
	import Board from "./Board.svelte";
	import { getLexer, K, KW_HEBREW, parse } from "./parser";
	import { getUser, login } from "./github";
	import * as showdown from "showdown";

	const tutorials = ["b28898ea969349781ff75853716d0978"];
	const mdConverter = new showdown.Converter();
	const n = 24;

	let board = Array.from(Array(n), () => new Array(n));
	let octokit: Octokit;
	let user: string;
	let description: string;

	async function init() {
		octokit = await login();
		user = await getUser(octokit);
	}

	init();

	const lexer = getLexer(true, KW_HEBREW);

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

	function sleep(ms: number) {}

	function color(i: number, j: number, v: number) {
		if (0 <= i && i < n && 0 <= j && j < n) {
			board[i][j] = v;
		}
		return 0;
	}

	function exec(code: string) {
		board.forEach((row) => row.fill(0));
		board = board;
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

	const highlight = (editor: HTMLElement) => {
		const code = editor.textContent;
		const div = document.createElement("div");
		let tokens = lexer.parse(code);
		while (tokens) {
			div.appendChild(token(tokens.text, tokens.kind));
			tokens = tokens.next;
		}
		editor.innerHTML = div.innerHTML;
	};

	addEventListener("DOMContentLoaded", () => {
		const jar = CodeJar(document.getElementById("editor"), highlight, {
			tab: "  ",
			indentOn: /.*:$/,
		});

		jar.onUpdate(exec);
	});
</script>

<main dir="rtl">
	<div class="menu">
		{#if user}
			{user}
		{:else}
			<a
				href="https://github.com/login/oauth/authorize?scope:gist&client_id=b22b1c742cd6f94f2a1e"
				>התחבר</a
			>
		{/if}
	</div>
	<div class="description">
		<div
			id="description"
			bind:innerHTML={description}
			contenteditable="false"
		/>
	</div>
	<div class="colors">
		{#each [...Array(16).keys()] as i}
			<div data-color={i}>
				{i}
			</div>
		{/each}
	</div>
	<div class="edit">
		<div id="editor" />
		<Board {board} />
	</div>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		width: 80em;
		margin: 2em auto;
	}

	.menu {
		display: flex;
		flex-direction: row;
		margin-bottom: 1em;
		background-color: #333;
		color: white;
		padding: 0.5em;
	}

	a {
		text-decoration: none;
		transition: all 0.2s ease-in-out;
		color: white;
	}

	a:hover {
		color: #dfd;
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
		margin-bottom: 1em;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: stretch;
	}

	[data-color] {
		display: flex;
		height: 2em;
		flex-grow: 1;
		font-size: 1em;
		justify-content: center;
		align-items: center;
		color: white;
	}

	[data-color]:first-child {
		color: #333;
	}
</style>
