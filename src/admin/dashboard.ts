export function renderDashboard() {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AdTrace Enterprise</title>
    <style>
      :root {
        --bg: #f7f3eb;
        --panel: rgba(255,255,255,0.78);
        --line: rgba(39, 34, 27, 0.08);
        --text: #241d17;
        --muted: #726457;
        --accent: #0f6d5f;
        --accent-soft: #d9f1eb;
        --gold: #c5832d;
        --shadow: 0 24px 60px rgba(57, 39, 16, 0.12);
      }

      * { box-sizing: border-box; }
      body {
        margin: 0;
        color: var(--text);
        font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", serif;
        background:
          radial-gradient(circle at top left, rgba(197, 131, 45, 0.18), transparent 26%),
          linear-gradient(135deg, #f7f3eb 0%, #f0ece2 45%, #efe6da 100%);
      }

      .shell {
        max-width: 1240px;
        margin: 0 auto;
        padding: 32px 20px 56px;
      }

      .hero {
        display: grid;
        grid-template-columns: 1.2fr 0.8fr;
        gap: 24px;
        align-items: stretch;
      }

      .hero-card,
      .panel {
        backdrop-filter: blur(10px);
        background: var(--panel);
        border: 1px solid var(--line);
        box-shadow: var(--shadow);
        border-radius: 28px;
      }

      .hero-card {
        padding: 28px;
      }

      .eyebrow {
        font-family: "Avenir Next", "Segoe UI", sans-serif;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--accent);
        font-size: 12px;
        margin-bottom: 16px;
      }

      h1 {
        margin: 0;
        font-size: clamp(2.2rem, 4vw, 4.4rem);
        line-height: 0.92;
      }

      .hero-copy {
        font-size: 1.08rem;
        line-height: 1.6;
        color: var(--muted);
        max-width: 58ch;
        margin: 18px 0 28px;
      }

      .hero-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }

      .button {
        border: 0;
        border-radius: 999px;
        padding: 14px 18px;
        font: 600 14px/1 "Avenir Next", "Segoe UI", sans-serif;
        cursor: pointer;
      }

      .button-primary {
        background: var(--text);
        color: white;
      }

      .button-secondary {
        background: var(--accent-soft);
        color: var(--accent);
      }

      .hero-metrics {
        padding: 24px;
        display: grid;
        gap: 14px;
      }

      .metric {
        padding: 16px 18px;
        border-radius: 20px;
        background: rgba(255,255,255,0.74);
        border: 1px solid var(--line);
      }

      .metric-label {
        color: var(--muted);
        font: 600 12px/1.2 "Avenir Next", "Segoe UI", sans-serif;
        text-transform: uppercase;
        letter-spacing: 0.14em;
      }

      .metric-value {
        margin-top: 10px;
        font-size: 2rem;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 20px;
        margin-top: 24px;
      }

      .panel {
        padding: 24px;
      }

      .span-7 { grid-column: span 7; }
      .span-5 { grid-column: span 5; }
      .span-4 { grid-column: span 4; }
      .span-8 { grid-column: span 8; }
      .span-12 { grid-column: span 12; }

      .section-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin-bottom: 18px;
      }

      .section-title h2 {
        margin: 0;
        font-size: 1.45rem;
      }

      .hint {
        color: var(--muted);
        font: 500 0.94rem/1.5 "Avenir Next", "Segoe UI", sans-serif;
      }

      .tenant-list,
      .plan-list,
      .event-list,
      .webhook-list {
        display: grid;
        gap: 14px;
      }

      .tenant-card,
      .plan-card,
      .event-card,
      .webhook-card {
        border: 1px solid var(--line);
        border-radius: 20px;
        padding: 16px;
        background: rgba(255,255,255,0.64);
      }

      .tenant-meta,
      .event-meta,
      .webhook-meta {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        margin-top: 12px;
        color: var(--muted);
        font: 500 0.9rem/1.4 "Avenir Next", "Segoe UI", sans-serif;
      }

      .pill {
        padding: 7px 10px;
        border-radius: 999px;
        background: rgba(15, 109, 95, 0.09);
        color: var(--accent);
        font: 700 11px/1 "Avenir Next", "Segoe UI", sans-serif;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .plan-price {
        font-size: 2rem;
        margin: 8px 0;
      }

      ul {
        padding-left: 18px;
        color: var(--muted);
      }

      code {
        font-family: "SFMono-Regular", "Menlo", monospace;
        font-size: 0.9em;
      }

      .footer-note {
        margin-top: 24px;
        color: var(--muted);
        font: 500 0.92rem/1.6 "Avenir Next", "Segoe UI", sans-serif;
      }

      @media (max-width: 980px) {
        .hero,
        .grid {
          grid-template-columns: 1fr;
        }
        .span-7,
        .span-5,
        .span-4,
        .span-8,
        .span-12 {
          grid-column: auto;
        }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <section class="hero">
        <article class="hero-card">
          <div class="eyebrow">Embedded Shopify Control Plane</div>
          <h1>AdTrace Enterprise turns fragmented markets into one attribution system.</h1>
          <p class="hero-copy">
            This admin surface is designed for operators, growth teams, and solution architects.
            It centralizes Shopify store installs, domain coverage, market mapping, Meta delivery,
            webhook compliance, and tracking diagnostics in one merchant-facing application.
          </p>
          <div class="hero-actions">
            <button class="button button-primary" id="refreshButton">Refresh telemetry</button>
            <button class="button button-secondary" id="copyInstallLinkButton">Create install link</button>
          </div>
          <p class="footer-note">
            Publish flow: install via Shopify OAuth, activate web pixel, confirm billing, map domains and markets,
            then validate Meta event quality before launch.
          </p>
        </article>
        <aside class="hero-metrics hero-card">
          <div class="metric">
            <div class="metric-label">Coverage</div>
            <div class="metric-value" id="metric-tenants">--</div>
          </div>
          <div class="metric">
            <div class="metric-label">Installed Shops</div>
            <div class="metric-value" id="metric-shops">--</div>
          </div>
          <div class="metric">
            <div class="metric-label">Tracked Events</div>
            <div class="metric-value" id="metric-events">--</div>
          </div>
        </aside>
      </section>

      <section class="grid">
        <article class="panel span-8">
          <div class="section-title">
            <h2>Tenants & Markets</h2>
            <div class="hint">Multi-tenant rollout, market density, and Meta readiness</div>
          </div>
          <div class="tenant-list" id="tenantList"></div>
        </article>

        <article class="panel span-4">
          <div class="section-title">
            <h2>Plan Catalog</h2>
            <div class="hint">Shopify Billing aligned tiers</div>
          </div>
          <div class="plan-list" id="planList"></div>
        </article>

        <article class="panel span-7">
          <div class="section-title">
            <h2>Recent Events</h2>
            <div class="hint">Server-side ingestion snapshots</div>
          </div>
          <div class="event-list" id="eventList"></div>
        </article>

        <article class="panel span-5">
          <div class="section-title">
            <h2>Webhook Compliance</h2>
            <div class="hint">App Store readiness and install lifecycle</div>
          </div>
          <div class="webhook-list" id="webhookList"></div>
        </article>

        <article class="panel span-12">
          <div class="section-title">
            <h2>Launch Sequence</h2>
            <div class="hint">Enterprise onboarding checklist for each Shopify merchant</div>
          </div>
          <ul>
            <li>Install the app through Shopify OAuth and persist an offline access token.</li>
            <li>Approve subscription billing and record the active plan inside the tenant profile.</li>
            <li>Activate the web pixel extension and create the merchant-specific pixel settings via Admin GraphQL.</li>
            <li>Map storefront domains and Shopify Markets to a single tenant profile.</li>
            <li>Validate purchase, checkout, and add-to-cart event delivery against Meta diagnostics.</li>
            <li>Keep GDPR webhooks green and app uninstall handling idempotent.</li>
          </ul>
        </article>
      </section>
    </main>
    <script>
      async function loadOverview() {
        const response = await fetch('/api/admin/overview');
        const payload = await response.json();

        document.getElementById('metric-tenants').textContent = payload.summary.tenants;
        document.getElementById('metric-shops').textContent = payload.summary.installedShops;
        document.getElementById('metric-events').textContent = payload.summary.trackedEvents;

        document.getElementById('tenantList').innerHTML = payload.tenants.map((tenant) => \`
          <div class="tenant-card">
            <div class="section-title">
              <strong>\${tenant.displayName}</strong>
              <span class="pill">\${tenant.plan.name}</span>
            </div>
            <div class="hint">\${tenant.shopDomain}</div>
            <div class="tenant-meta">
              <span>\${tenant.domains} domains</span>
              <span>\${tenant.markets} markets</span>
              <span>\${tenant.eventCount} events ingested</span>
              <span>Meta \${tenant.metaEnabled ? 'connected' : 'pending'}</span>
            </div>
          </div>
        \`).join('');

        document.getElementById('planList').innerHTML = payload.plans.map((plan) => \`
          <div class="plan-card">
            <strong>\${plan.name}</strong>
            <div class="plan-price">$\${plan.monthlyPrice}<span class="hint">/mo</span></div>
            <div class="hint">\${plan.bestFor}</div>
            <ul>\${plan.features.map((feature) => \`<li>\${feature}</li>\`).join('')}</ul>
          </div>
        \`).join('');

        document.getElementById('eventList').innerHTML = payload.recentEvents.length ? payload.recentEvents.map((event) => \`
          <div class="event-card">
            <strong>\${event.eventName}</strong>
            <div class="event-meta">
              <span>\${event.shopDomain}</span>
              <span>\${event.market.countryCode}/\${event.market.currencyCode}</span>
              <span>\${event.source}</span>
              <span>\${event.deliveredToMeta ? 'Meta delivered' : 'Meta queued'}</span>
            </div>
          </div>
        \`).join('') : '<div class="event-card"><strong>No events yet</strong><div class="hint">Use the web pixel or POST /api/events to populate diagnostics.</div></div>';

        document.getElementById('webhookList').innerHTML = payload.recentWebhooks.length ? payload.recentWebhooks.map((entry) => \`
          <div class="webhook-card">
            <strong>\${entry.topic}</strong>
            <div class="webhook-meta">
              <span>\${entry.shopDomain || 'unknown shop'}</span>
              <span>\${entry.verified ? 'verified' : 'rejected'}</span>
              <span>\${new Date(entry.receivedAt).toLocaleString()}</span>
            </div>
          </div>
        \`).join('') : '<div class="webhook-card"><strong>No webhook traffic yet</strong><div class="hint">Compliance and app lifecycle webhooks will appear here.</div></div>';
      }

      async function createInstallLink() {
        const shop = prompt('Enter a myshopify shop domain', 'demo-shop.myshopify.com');
        if (!shop) return;

        const response = await fetch('/api/admin/onboarding/install-link?shop=' + encodeURIComponent(shop));
        const payload = await response.json();
        if (!response.ok) {
          alert(payload.error || 'Unable to generate install link');
          return;
        }
        await navigator.clipboard.writeText(payload.installUrl);
        alert('Install URL copied to clipboard');
      }

      document.getElementById('refreshButton').addEventListener('click', loadOverview);
      document.getElementById('copyInstallLinkButton').addEventListener('click', createInstallLink);
      loadOverview();
    </script>
  </body>
</html>`;
}
