import { marked } from "marked";
const app = document.getElementById("app");
function renderLanding() {
    app.innerHTML = `
    <header>
      <h1>clawdump</h1>
      <p>A sharing tool for <a href="https://openclaw.ai" target="_blank">OpenClaw</a> context files.</p>
    </header>
    <main>
      <div class="landing">
        <p>To view a dump, open a link shared with you:</p>
        <code>luebken.github.io/clawdump/#&lt;gistId&gt;</code>
        <p>To create your own dump, install the skill:</p>
        <pre>git clone https://github.com/luebken/clawdump ~/.openclaw/skills/clawdump</pre>
      </div>
    </main>
  `;
}
function renderError(message) {
    app.innerHTML = `
    <header><h1>clawdump</h1></header>
    <main><div class="error">${message}</div></main>
  `;
}
function renderLoading() {
    app.innerHTML = `
    <header><h1>clawdump</h1></header>
    <main><div class="loading">Loading…</div></main>
  `;
}
async function renderGist(gistId) {
    renderLoading();
    let gist;
    try {
        const res = await fetch(`https://api.github.com/gists/${gistId}`);
        if (!res.ok)
            throw new Error(`GitHub API returned ${res.status}`);
        gist = await res.json();
    }
    catch (e) {
        renderError(`Could not load gist: ${e instanceof Error ? e.message : e}`);
        return;
    }
    const files = Object.values(gist.files);
    const date = new Date(gist.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    const panels = await Promise.all(files.map(async (file) => {
        const html = await marked.parse(file.content ?? "");
        return `
        <section class="file-panel">
          <div class="file-header">
            <span class="filename">${file.filename}</span>
          </div>
          <div class="file-content markdown">${html}</div>
        </section>
      `;
    }));
    app.innerHTML = `
    <header>
      <h1>clawdump</h1>
      <div class="meta">
        <span>by <strong>${gist.owner?.login ?? "anonymous"}</strong></span>
        <span>${date}</span>
        <a href="https://gist.github.com/${gistId}" target="_blank">view raw ↗</a>
      </div>
    </header>
    <main>${panels.join("")}</main>
  `;
}
function route() {
    const gistId = window.location.hash.slice(1);
    if (gistId) {
        renderGist(gistId);
    }
    else {
        renderLanding();
    }
}
window.addEventListener("hashchange", route);
route();
