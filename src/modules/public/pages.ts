type SupportPageParams = {
  success?: boolean;
  requestId?: string;
  error?: string;
};

const baseStyles = `
  :root {
    --bg: #f6f1e7;
    --panel: rgba(255,255,255,0.88);
    --line: rgba(31, 25, 18, 0.1);
    --text: #1f1912;
    --muted: #6b5d4d;
    --accent: #0b6b5c;
    --accent-soft: #d6f1ea;
    --shadow: 0 24px 60px rgba(54, 36, 17, 0.12);
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    color: var(--text);
    font-family: "Avenir Next", "Segoe UI", sans-serif;
    background:
      radial-gradient(circle at top left, rgba(182, 118, 37, 0.18), transparent 22%),
      linear-gradient(145deg, #f8f4ee 0%, #efe8dc 48%, #efe4d6 100%);
  }
  .shell {
    max-width: 980px;
    margin: 0 auto;
    padding: 28px 18px 64px;
  }
  .card {
    background: var(--panel);
    border: 1px solid var(--line);
    box-shadow: var(--shadow);
    border-radius: 24px;
    padding: 24px;
    backdrop-filter: blur(8px);
    margin-bottom: 18px;
  }
  .eyebrow {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--accent);
    font-weight: 700;
  }
  h1 {
    font-size: clamp(2rem, 4vw, 4rem);
    line-height: 0.96;
    margin: 12px 0 18px;
    font-family: "Iowan Old Style", "Palatino Linotype", serif;
  }
  h2 {
    font-size: 1.35rem;
    margin: 0 0 10px;
    font-family: "Iowan Old Style", "Palatino Linotype", serif;
  }
  p, li {
    color: var(--muted);
    line-height: 1.65;
    font-size: 0.98rem;
  }
  ul {
    margin: 0;
    padding-left: 18px;
  }
  .grid {
    display: grid;
    gap: 18px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .stack {
    display: grid;
    gap: 14px;
  }
  label {
    display: block;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted);
    font-weight: 700;
    margin-bottom: 8px;
  }
  input, select, textarea {
    width: 100%;
    border-radius: 14px;
    border: 1px solid var(--line);
    background: rgba(255,255,255,0.9);
    padding: 12px 14px;
    color: var(--text);
    font: inherit;
  }
  textarea {
    min-height: 160px;
    resize: vertical;
  }
  .button {
    border: 0;
    border-radius: 999px;
    padding: 12px 16px;
    font-weight: 700;
    cursor: pointer;
    background: var(--text);
    color: #fff;
  }
  .notice {
    border-radius: 18px;
    padding: 14px 16px;
    border: 1px solid var(--line);
    background: rgba(255,255,255,0.78);
  }
  .success {
    background: var(--accent-soft);
    color: var(--accent);
  }
  .error {
    background: #fff2ef;
    color: #a2492f;
  }
  .meta {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  .pill {
    display: inline-block;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(11, 107, 92, 0.1);
    color: var(--accent);
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  @media (max-width: 760px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
`;

export function renderPrivacyPage() {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Privacy Policy | FB Pixel CAPI</title>
    <style>${baseStyles}</style>
  </head>
  <body>
    <main class="shell">
      <section class="card">
        <div class="eyebrow">Privacy Policy</div>
        <h1>How FB Pixel CAPI handles merchant, customer, and event data.</h1>
        <p>
          FB Pixel CAPI is a hosted tracking and attribution platform for Shopify merchants.
          This policy explains what data the application processes, why it is processed, and
          how merchants can manage that data when they use the service across multiple stores,
          domains, and markets.
        </p>
        <div class="meta">
          <span class="pill">Effective March 30, 2026</span>
          <span class="pill">Applies to /app, /support, and connected Shopify stores</span>
        </div>
      </section>

      <section class="grid">
        <article class="card">
          <h2>Information the service processes</h2>
          <ul>
            <li>Operator account data such as name, email address, role, and session activity.</li>
            <li>Shop installation data such as shop domain, granted scopes, and app status.</li>
            <li>Merchant configuration data such as enabled scenarios, custom mappings, domains, markets, and destination settings.</li>
            <li>Tracking event data such as page activity, cart actions, checkout steps, purchase events, delivery status, and quality diagnostics.</li>
            <li>Identity and matching data such as anonymous identifiers, customer identifiers, hashed or raw contact fields received from merchant event streams, and event-level market context.</li>
            <li>Support request data submitted through the support portal.</li>
          </ul>
        </article>

        <article class="card">
          <h2>Why the service processes data</h2>
          <ul>
            <li>To connect a merchant’s Shopify store and maintain the installation lifecycle.</li>
            <li>To normalize tracking events across domains, markets, and destinations.</li>
            <li>To deduplicate browser and server events and improve delivery reliability.</li>
            <li>To route approved event data to configured destinations such as Meta, GA4, Google Ads, and TikTok.</li>
            <li>To provide dashboards, diagnostics, support, and security monitoring.</li>
          </ul>
        </article>
      </section>

      <section class="card stack">
        <div>
          <h2>How merchant data is controlled</h2>
          <p>
            Merchants control which stores are connected, which scenarios are enabled, which
            custom event names are mapped, and which destinations receive data. Tenant, domain,
            and market-specific destination settings are stored in the application database and
            applied only to the relevant merchant workspace.
          </p>
        </div>
        <div>
          <h2>Data sharing</h2>
          <p>
            The service shares tracking data only with the destinations that a merchant has
            configured inside the control plane. Examples include Meta, Google Analytics 4,
            Google Ads, and TikTok. Each merchant is responsible for enabling only the
            destinations they intend to use and for ensuring that their own privacy disclosures
            accurately describe those integrations.
          </p>
        </div>
        <div>
          <h2>Security and retention</h2>
          <p>
            Account sessions, installations, events, and support submissions are stored on the
            application backend. Access is restricted through operator accounts, tenant roles,
            and application-level authentication. Data is retained for service operation,
            troubleshooting, auditability, and merchant support unless deletion is requested or
            the merchant relationship ends.
          </p>
        </div>
        <div>
          <h2>Privacy requests</h2>
          <p>
            Privacy, deletion, and support requests can be submitted through the support portal
            on this site. Requests should include the Shopify shop domain and enough context to
            identify the affected workspace or event data.
          </p>
        </div>
      </section>
    </main>
  </body>
</html>`;
}

export function renderSupportPage(params: SupportPageParams = {}) {
  const notice = params.success
    ? `<div class="notice success">Support request recorded successfully. Reference: <strong>${escapeHtml(params.requestId ?? "")}</strong></div>`
    : params.error
      ? `<div class="notice error">${escapeHtml(params.error)}</div>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Support | FB Pixel CAPI</title>
    <style>${baseStyles}</style>
  </head>
  <body>
    <main class="shell">
      <section class="card">
        <div class="eyebrow">Support Portal</div>
        <h1>Submit a support request for installation, tracking, or delivery issues.</h1>
        <p>
          Use this portal to report installation problems, market and domain configuration
          issues, event mapping errors, destination delivery failures, privacy requests, or
          billing questions. Include the Shopify shop domain and the specific event or order
          context whenever possible.
        </p>
        ${notice}
      </section>

      <section class="grid">
        <article class="card">
          <h2>What to include</h2>
          <ul>
            <li>The Shopify shop domain connected to the issue.</li>
            <li>The domain or market where the issue occurred.</li>
            <li>The event name, order id, or checkout step involved.</li>
            <li>The destination affected, if the problem is delivery-related.</li>
            <li>Any recent config changes that may have caused the issue.</li>
          </ul>
        </article>

        <article class="card">
          <h2>Support categories</h2>
          <ul>
            <li>Installation and OAuth</li>
            <li>Markets and domains</li>
            <li>Event mapping and dataLayer issues</li>
            <li>Destination delivery and diagnostics</li>
            <li>Privacy and data handling</li>
            <li>Billing and account access</li>
          </ul>
        </article>
      </section>

      <section class="card">
        <form method="post" action="/support" class="stack">
          <div class="grid">
            <div>
              <label for="name">Name</label>
              <input id="name" name="name" required />
            </div>
            <div>
              <label for="email">Email</label>
              <input id="email" name="email" type="email" required />
            </div>
          </div>
          <div class="grid">
            <div>
              <label for="shopDomain">Shopify shop domain</label>
              <input id="shopDomain" name="shopDomain" placeholder="example.myshopify.com" />
            </div>
            <div>
              <label for="category">Category</label>
              <select id="category" name="category" required>
                <option value="installation">Installation and OAuth</option>
                <option value="markets_and_domains">Markets and domains</option>
                <option value="event_mapping">Event mapping and dataLayer</option>
                <option value="destination_delivery">Destination delivery</option>
                <option value="billing">Billing and account access</option>
                <option value="privacy">Privacy request</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label for="subject">Subject</label>
            <input id="subject" name="subject" required />
          </div>
          <div>
            <label for="description">Description</label>
            <textarea id="description" name="description" required></textarea>
          </div>
          <div>
            <button class="button" type="submit">Submit support request</button>
          </div>
        </form>
      </section>
    </main>
  </body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
