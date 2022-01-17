<script lang="ts">
	// https://github.com/antonmedv/codejar
	import { CodeJar } from "codejar";
	import Board from "./Board.svelte";
	import { getLexer, K, KW_HEBREW, parse } from "./parser";
	import { Octokit } from "octokit";

	const n = 24;
	const board = Array.from(Array(n), () => new Array(n));
	let user;

	async function storeAccessToken(code: string) {
		const res = await fetch(
			`https://2dl08ocvy5.execute-api.us-east-1.amazonaws.com/github_login?code=${params.code}`
		);
		const json = await res.json();
		const authParams = Object.fromEntries(
			new URLSearchParams(json).entries()
		);
		localStorage.setItem("access_token", authParams.access_token);
	}

	const urlSearchParams = new URLSearchParams(window.location.search);
	const params = Object.fromEntries(urlSearchParams.entries());

	let octokit: Octokit;
	let gists = [];
	async function login() {
		if (params.code) {
			const path =
				location.pathname +
				location.search
					.replace(/\b(code|state)=\w+/g, "")
					.replace(/[?&]+$/, "");
			history.pushState({}, "", path);

			await storeAccessToken(params.code);
		}
		const access_token = localStorage.getItem("access_token");
		octokit = new Octokit({ auth: access_token });

		const {
			data: { name },
		} = await octokit.request("GET /user");

		user = name;
		gists = (await octokit.rest.gists.list()).data;
		console.log(gists);
	}

	login();

	let jar;
	let description;
	async function save() {
		const res = await octokit.rest.gists.create({
			description: description,
			public: true,
			files: {
				"app.kidkidkod": {
					content: jar.toString(),
				},
			},
		});
		console.log(res);
	}

	addEventListener("DOMContentLoaded", () => {
		const editor = document.getElementById("editor") as HTMLTextAreaElement;
		const lexer = getLexer(true, KW_HEBREW);

		function sleep(ms: number) {}

		function color(i: number, j: number, v: number) {
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
				e.setAttribute("kind", kind.toString());
				return e;
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

		jar = CodeJar(editor, highlight, {
			tab: "  ",
			indentOn: /.*:$/,
		});

		function exec(code: string) {
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
		const code = `# דוגמה לשימוש בפונקציה צבע
		
לכל שורה מ 0 עד 23:
  לכל עמודה מ 0 עד 23:
    צבע(שורה, עמודה, (שורה + עמודה) % 2)
  סוף
סוף`;
		jar.updateCode(code);
		exec(code);
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
	<div class="colors">
		{#each [...Array(16).keys()] as i}
			<div data-color={i}>
				{i}
			</div>
		{/each}
	</div>
	<div class="edit">
		<div class="col">
			<div id="editor" />
			<div class="row margin-top">
				<input
					bind:value={description}
					type="text"
					placeholder="תיאור"
				/>
				<button on:click={save}>שמור</button>
			</div>
		</div>
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

	.margin-top {
		margin-top: 1em;
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

	.col {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
	}

	.row {
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
