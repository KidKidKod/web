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
    const path =
        location.pathname +
        location.search
            .replace(new RegExp(`\b${key}=\w+`, 'g'), "")
            .replace(/[?&]+$/, "");
    history.pushState({}, "", path);
}

function getParams() {
    return Object.fromEntries(new URLSearchParams(window.location.search).entries());
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

export async function getUser(octokit: Octokit) {
    const {
        data: { name },
    } = await octokit.request("GET /user");
    return name
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








