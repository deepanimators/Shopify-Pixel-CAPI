export function renderLoginPage(params: {
  title: string;
  action: "/auth/login" | "/auth/register";
  subtitle: string;
  submitLabel: string;
  error?: string;
}) {
  const showDisplayName = params.action === "/auth/register";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(params.title)}</title>
    <style>
      body { margin: 0; font-family: "Avenir Next", "Segoe UI", sans-serif; background: linear-gradient(160deg, #f5efe4, #efe4d6); color: #241d17; }
      .wrap { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
      .card { width: min(460px, 100%); background: rgba(255,255,255,0.92); border-radius: 28px; padding: 28px; box-shadow: 0 30px 70px rgba(54,36,17,0.14); }
      h1 { margin: 0 0 10px; font-size: 2rem; }
      p { margin: 0 0 18px; color: #6b5d4d; line-height: 1.5; }
      label { display: block; margin: 14px 0 8px; font-weight: 700; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #6b5d4d; }
      input { width: 100%; box-sizing: border-box; border-radius: 14px; border: 1px solid rgba(36,29,23,0.12); padding: 12px 14px; font-size: 14px; }
      button { width: 100%; border: 0; border-radius: 999px; padding: 14px; margin-top: 18px; background: #241d17; color: white; font-weight: 700; cursor: pointer; }
      .error { margin-top: 14px; padding: 12px 14px; border-radius: 14px; background: rgba(158,43,43,0.1); color: #9e2b2b; }
      .switch { margin-top: 16px; font-size: 14px; }
      a { color: #0b6b5c; text-decoration: none; font-weight: 700; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <form class="card" method="post" action="${params.action}">
        <h1>${escapeHtml(params.title)}</h1>
        <p>${escapeHtml(params.subtitle)}</p>
        ${showDisplayName
          ? `<label for="displayName">Display name</label>
        <input id="displayName" name="displayName" placeholder="Deepak" autocomplete="name" required />`
          : ""}
        <label for="email">Email</label>
        <input id="email" name="email" type="email" placeholder="you@company.com" autocomplete="email" required />
        <label for="password">Password</label>
        <input id="password" name="password" type="password" placeholder="Minimum 8 characters" autocomplete="${showDisplayName ? "new-password" : "current-password"}" required />
        <button type="submit">${escapeHtml(params.submitLabel)}</button>
        ${params.error ? `<div class="error">${escapeHtml(params.error)}</div>` : ""}
        <div class="switch">
          ${params.action === "/auth/login"
            ? `Need an account? <a href="/auth/register">Register</a>`
            : `Already have an account? <a href="/auth/login">Sign in</a>`}
        </div>
      </form>
    </div>
  </body>
</html>`;
}

function escapeHtml(value: string) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
