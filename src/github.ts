import { Octokit } from "octokit";

async function getAccessToken(code: string) {
    const res = await fetch(
        `https://2dl08ocvy5.execute-api.us-east-1.amazonaws.com/github_login?code=${code}`
    );
    const json = await res.json();
    const authParams = Object.fromEntries(
        new URLSearchParams(json).entries()
    );
    return authParams.access_token;
}

function rmQueryParam(key: string) {
    const params = new URLSearchParams(location.search)
    params.delete(key)
    const url = `${location.pathname}?${params.toString()}`
    console.log(url)
    history.pushState({}, "", url)
}

function getParams() {
    return Object.fromEntries(new URLSearchParams(location.search).entries());
}

export async function login() {
    const params = getParams();

    if (params.code) {
        rmQueryParam('code')
        localStorage.setItem("access_token", await getAccessToken(params.code));
    }

    const access_token = localStorage.getItem("access_token");

    if (!access_token) {
        return
    }

    return new Octokit({ auth: access_token });
}

export async function getUser(octokit: Octokit | undefined) {
    if (!octokit) {
        return
    }

    const {
        data: { name },
    } = await octokit.request("GET /user");

    return name
}

export function loadGist(octokit: Octokit | undefined, gistId: string) {
    if (!octokit) {
        return
    }

    return octokit.request("GET /gists/" + gistId);
}

// async function save() {
//     const res = await octokit.rest.gists.create({
//         description: "https://KidKidKod.com",
//         public: true,
//         files: {
//             "app.md": {
//                 content: markdown,
//             },
//             "app.kidkidkod": {
//                 content: jar.toString(),
//             },
//         },
//     });
//     console.log(res);
// }








