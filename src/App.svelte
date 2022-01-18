<script lang="ts">
	// https://github.com/antonmedv/codejar
	import type { Octokit } from "octokit";
	import { CodeJar } from "codejar";
	import Board from "./Board.svelte";
	import { getLexer, K, KW_HEBREW, parse } from "./parser";
	import { getUser, loadGist, login } from "./github";
	import * as showdown from "showdown";

	const n = 16;
	const tutorials = [
		"b28898ea969349781ff75853716d0978",
		"c524426ed5199944e9cbc1b938f6cf31",
	];
	const mdConverter = new showdown.Converter();
	const yay = new Audio("yay.mp3");

	let level = +localStorage.getItem("level") || 0;
	$: tutorial = tutorials[level];

	let target = Array.from(Array(n), () => new Array(n));
	let board = Array.from(Array(n), () => new Array(n));
	let octokit: Octokit;
	let user: string;
	let description: string;
	let solution: string;
	$: status = JSON.stringify(target) === JSON.stringify(board) ? "😍" : "😒";

	async function updateGist() {
		const {
			data: { files },
		} = await loadGist(octokit, tutorial);
		description = mdConverter.makeHtml(files["kidkidkod.md"].content);
		solution = files["kidkidkod.app"].content;
		console.log(solution);
		target = exec(target)(solution);
	}

	async function init() {
		octokit = await login();
		user = await getUser(octokit);
		updateGist();
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

	const color = (board: number[][]) => (i: number, j: number, v: number) => {
		if (0 <= i && i < n && 0 <= j && j < n) {
			board[i][j] = v;
		}
		return 0;
	};

	const exec = (board: number[][]) => (code: string) => {
		board.forEach((row) => row.fill(0));

		const host = {
			vars: {},
			funcs: {
				צבע: color(board),
				נמנם: sleep,
			},
		};

		const prog = parse(code, {
			host,
			lexer: getLexer(false, KW_HEBREW),
		});

		prog.forEach((s) => s.eval());
		return board;
	};

	function updateBoard(code: string) {
		board = exec(board)(code);
		if (JSON.stringify(board) === JSON.stringify(target)) {
			yay.play();
			level += 1;
			localStorage.setItem("level", level.toString());
			updateGist();
		}
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

		jar.onUpdate(updateBoard);
	});
</script>

<main dir="rtl">
	<div class="menu">
		<div class="status">{status}</div>
		{#if user}
			{user}
		{:else}
			<a
				href="https://github.com/login/oauth/authorize?scope:gist&client_id=b22b1c742cd6f94f2a1e"
				>התחבר</a
			>
		{/if}
	</div>
	<div class="row">
		<div
			id="description"
			bind:innerHTML={description}
			contenteditable="false"
		/>
		<Board board={target} />
	</div>
	<div class="colors">
		{#each [...Array(16).keys()] as i}
			<div data-color={i}>
				{i}
			</div>
		{/each}
	</div>
	<div class="row">
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
		padding: 0.5em;
		align-items: center;
		justify-content: space-between;
	}

	.status {
		font-size: 2em;
	}

	a {
		text-decoration: none;
		transition: all 0.2s ease-in-out;
	}

	a:hover {
		color: #363;
	}

	.row {
		display: flex;
		flex-direction: row;
	}

	#description {
		flex-grow: 1;
	}

	#editor {
		flex-grow: 1;
		border: 1px solid #ccc;
		font-family: Consolas, monospace;
		line-height: 1.5;
		padding: 0.5em;
		margin: 0;
		margin-left: 1em;
	}

	.colors {
		margin: 1em 0;
		border: 1px solid #ddd;
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
