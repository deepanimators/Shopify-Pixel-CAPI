export function renderDashboard() {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AdTrace Enterprise</title>
    <style>
      :root {
        --bg: #f5efe4;
        --panel: rgba(255, 255, 255, 0.82);
        --line: rgba(36, 29, 23, 0.1);
        --text: #211912;
        --muted: #6b5d4d;
        --accent: #0b6b5c;
        --accent-soft: #d6f1ea;
        --warm: #b67625;
        --shadow: 0 24px 60px rgba(54, 36, 17, 0.12);
      }

      * { box-sizing: border-box; }
      body {
        margin: 0;
        color: var(--text);
        font-family: "Iowan Old Style", "Palatino Linotype", serif;
        background:
          radial-gradient(circle at top left, rgba(182, 118, 37, 0.18), transparent 22%),
          linear-gradient(145deg, #f8f4ee 0%, #efe8dc 48%, #efe4d6 100%);
      }

      .shell {
        max-width: 1360px;
        margin: 0 auto;
        padding: 28px 18px 64px;
      }

      .hero,
      .grid {
        display: grid;
        gap: 18px;
      }

      .hero {
        grid-template-columns: 1.15fr 0.85fr;
      }

      .grid {
        grid-template-columns: repeat(12, 1fr);
        margin-top: 18px;
      }

      .card {
        background: var(--panel);
        border: 1px solid var(--line);
        box-shadow: var(--shadow);
        border-radius: 26px;
        padding: 22px;
        backdrop-filter: blur(8px);
      }

      .span-4 { grid-column: span 4; }
      .span-5 { grid-column: span 5; }
      .span-6 { grid-column: span 6; }
      .span-7 { grid-column: span 7; }
      .span-8 { grid-column: span 8; }
      .span-12 { grid-column: span 12; }

      .eyebrow {
        font: 700 12px/1.2 "Avenir Next", "Segoe UI", sans-serif;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        color: var(--accent);
      }

      h1, h2, h3, p { margin-top: 0; }
      h1 {
        font-size: clamp(2.2rem, 4vw, 4.7rem);
        line-height: 0.95;
        margin: 14px 0 18px;
      }

      h2 {
        font-size: 1.45rem;
        margin-bottom: 8px;
      }

      .muted {
        color: var(--muted);
        font: 500 0.96rem/1.55 "Avenir Next", "Segoe UI", sans-serif;
      }

      .hero-actions,
      .row,
      .tenant-meta,
      .metric-strip,
      .tab-bar {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        align-items: center;
      }

      .metric-strip {
        margin-top: 14px;
      }

      .metric {
        min-width: 150px;
        padding: 16px;
        border-radius: 18px;
        border: 1px solid var(--line);
        background: rgba(255,255,255,0.7);
      }

      .metric-label {
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font: 700 11px/1.2 "Avenir Next", "Segoe UI", sans-serif;
      }

      .metric-value {
        margin-top: 8px;
        font-size: 1.95rem;
      }

      .button {
        border: 0;
        border-radius: 999px;
        padding: 12px 16px;
        font: 700 13px/1 "Avenir Next", "Segoe UI", sans-serif;
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

      .tab-button {
        background: rgba(255,255,255,0.78);
        color: var(--muted);
        border: 1px solid var(--line);
      }

      .tab-button.is-active {
        background: var(--text);
        color: white;
      }

      label {
        display: block;
        margin-bottom: 8px;
        font: 700 12px/1.2 "Avenir Next", "Segoe UI", sans-serif;
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      input,
      select,
      textarea {
        width: 100%;
        border-radius: 14px;
        border: 1px solid var(--line);
        background: rgba(255,255,255,0.82);
        padding: 12px 14px;
        font: 500 14px/1.4 "Avenir Next", "Segoe UI", sans-serif;
        color: var(--text);
      }

      .stack {
        display: grid;
        gap: 14px;
      }

      .scenario-list,
      .mapping-list,
      .destination-list,
      .event-list,
      .commerce-list,
      .order-list {
        display: grid;
        gap: 12px;
      }

      .item {
        border: 1px solid var(--line);
        border-radius: 18px;
        padding: 14px;
        background: rgba(255,255,255,0.68);
      }

      [data-tab-panel] {
        display: none;
      }

      [data-tab-panel].is-active {
        display: grid;
      }

      .pill {
        display: inline-block;
        padding: 6px 9px;
        border-radius: 999px;
        background: rgba(11, 107, 92, 0.1);
        color: var(--accent);
        font: 700 11px/1 "Avenir Next", "Segoe UI", sans-serif;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .checkbox-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        max-height: 420px;
        overflow: auto;
        padding-right: 4px;
      }

      .checkbox-item {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        padding: 10px 12px;
        border: 1px solid var(--line);
        border-radius: 16px;
        background: rgba(255,255,255,0.7);
      }

      .checkbox-item input {
        width: auto;
        margin-top: 2px;
      }

      .destination-card h3 {
        margin-bottom: 6px;
      }

      .status {
        min-height: 18px;
        color: var(--accent);
        font: 700 12px/1.4 "Avenir Next", "Segoe UI", sans-serif;
      }

      .mapping-row {
        display: grid;
        grid-template-columns: 1.1fr 1.2fr auto;
        gap: 10px;
        align-items: end;
      }

      .scope-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
      }

      .summary-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 10px;
      }

      .summary-stat {
        border: 1px solid var(--line);
        border-radius: 18px;
        padding: 14px;
        background: rgba(255,255,255,0.7);
      }

      .summary-stat strong {
        display: block;
        font-size: 1.5rem;
        margin-top: 6px;
      }

      .table-head,
      .table-row {
        display: grid;
        gap: 10px;
        align-items: center;
      }

      .table-head {
        color: var(--muted);
        font: 700 11px/1.2 "Avenir Next", "Segoe UI", sans-serif;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .product-grid,
      .purchase-grid {
        grid-template-columns: 1.8fr 0.8fr 0.8fr 0.8fr 0.8fr;
      }

      .order-grid {
        grid-template-columns: 1.4fr 1fr 0.9fr 1.2fr 0.9fr;
      }

      .badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        padding: 6px 10px;
        font: 700 11px/1 "Avenir Next", "Segoe UI", sans-serif;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      .badge-good {
        background: rgba(11, 107, 92, 0.12);
        color: var(--accent);
      }

      .badge-warn {
        background: rgba(182, 118, 37, 0.16);
        color: var(--warm);
      }

      .badge-bad {
        background: rgba(158, 43, 43, 0.14);
        color: #9e2b2b;
      }

      @media (max-width: 1080px) {
        .hero,
        .grid {
          grid-template-columns: 1fr;
        }
        .span-4, .span-5, .span-6, .span-7, .span-8, .span-12 {
          grid-column: auto;
        }
        .checkbox-grid {
          grid-template-columns: 1fr;
        }
        .mapping-row {
          grid-template-columns: 1fr;
        }
        .scope-grid {
          grid-template-columns: 1fr;
        }
        .summary-grid,
        .product-grid,
        .purchase-grid,
        .order-grid {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <section class="hero">
        <article class="card">
          <div class="eyebrow">Shopify Tracking Control Plane</div>
          <h1>Map merchant dataLayer names into one canonical attribution model.</h1>
          <p class="muted">
            This embedded surface lets each merchant choose which tracking scenarios are enabled,
            map their own raw event names into canonical ecommerce journeys, and configure
            destination adapters for Meta, GA4, Google Ads, and TikTok from one place.
          </p>
          <div class="hero-actions">
            <button class="button button-primary" id="refreshButton">Refresh workspace</button>
            <button class="button button-secondary" id="copyInstallLinkButton">Create install link</button>
          </div>
        </article>
        <aside class="card">
          <div class="row" style="justify-content: space-between; align-items: flex-start;">
            <div>
              <div class="metric-label">Signed In</div>
              <strong id="currentUserName">--</strong>
              <div class="muted" id="currentUserMeta">Loading session…</div>
            </div>
            <form method="post" action="/auth/logout">
              <button class="button button-secondary" type="submit">Logout</button>
            </form>
          </div>
          <div class="metric-strip">
            <div class="metric">
              <div class="metric-label">Tenants</div>
              <div class="metric-value" id="metricTenants">--</div>
            </div>
            <div class="metric">
              <div class="metric-label">Tracked Events</div>
              <div class="metric-value" id="metricEvents">--</div>
            </div>
            <div class="metric">
              <div class="metric-label">Scenarios</div>
              <div class="metric-value" id="metricScenarios">--</div>
            </div>
          </div>
          <p class="muted" id="summaryHint">
            Loading current coverage, destinations, and tenant tracking configuration.
          </p>
        </aside>
      </section>

      <section class="card" style="margin-top: 18px;">
        <div class="tab-bar">
          <button class="button tab-button is-active" data-tab="overview">Overview</button>
          <button class="button tab-button" data-tab="commerce">Commerce</button>
          <button class="button tab-button" data-tab="tracking">Tracking</button>
          <button class="button tab-button" data-tab="destinations">Destinations</button>
          <button class="button tab-button" data-tab="installs">Installs</button>
        </div>
      </section>

      <section class="grid">
        <article class="card span-4 stack is-active" data-tab-panel="overview">
          <div>
            <h2>Tenant Workspace</h2>
            <p class="muted">Choose the merchant whose tracking rules and destinations you want to manage.</p>
          </div>
          <div>
            <label for="tenantSelect">Tenant</label>
            <select id="tenantSelect"></select>
          </div>
          <div class="item">
            <div class="row">
              <strong id="tenantName">--</strong>
              <span class="pill" id="tenantPlan">--</span>
            </div>
            <div class="tenant-meta muted">
              <span id="tenantShop">--</span>
              <span id="tenantDomains">-- domains</span>
              <span id="tenantMarkets">-- markets</span>
              <span id="tenantEnabledScenarios">-- scenarios enabled</span>
            </div>
          </div>
          <div class="item">
            <strong>Custom Event Mappings</strong>
            <div class="muted" id="mappingCount">0 mappings configured</div>
          </div>
          <div class="status" id="workspaceStatus"></div>
        </article>

        <article class="card span-8 stack is-active" data-tab-panel="overview commerce">
          <div>
            <h2>Commerce Pulse</h2>
            <p class="muted">A merchant-facing view of tracked products, purchases, orders, and delivery health across connected destinations.</p>
          </div>
          <div class="summary-grid" id="commerceSummary"></div>
          <div class="commerce-list" id="destinationBreakdown"></div>
        </article>

        <article class="card span-6 stack" data-tab-panel="commerce">
          <div>
            <h2>Top Products</h2>
            <p class="muted">See which products are being viewed, added to cart, purchased, and successfully delivered to destinations.</p>
          </div>
          <div class="table-head product-grid">
            <span>Product</span>
            <span>Views</span>
            <span>Adds</span>
            <span>Purchases</span>
            <span>Revenue</span>
          </div>
          <div class="commerce-list" id="productList"></div>
        </article>

        <article class="card span-6 stack" data-tab-panel="commerce">
          <div>
            <h2>Recent Purchases</h2>
            <p class="muted">Recent purchase events and whether they were delivered, skipped, previewed, or need attention.</p>
          </div>
          <div class="table-head purchase-grid">
            <span>Order</span>
            <span>Value</span>
            <span>Market</span>
            <span>Quality</span>
            <span>Status</span>
          </div>
          <div class="commerce-list" id="purchaseList"></div>
        </article>

        <article class="card span-12 stack" data-tab-panel="commerce">
          <div>
            <h2>Order Tracking Status</h2>
            <p class="muted">Track checkout progression and purchase delivery health by order from inside this admin.</p>
          </div>
          <div class="table-head order-grid">
            <span>Order</span>
            <span>Timeline</span>
            <span>Value</span>
            <span>Tracking</span>
            <span>Updated</span>
          </div>
          <div class="order-list" id="orderList"></div>
        </article>

        <article class="card span-8 stack" data-tab-panel="tracking">
          <div>
            <h2>Scenario Manager</h2>
            <p class="muted">
              Enable only the scenarios this merchant actually uses. Unknown dataLayer names can then be
              explicitly mapped into these canonical journeys.
            </p>
          </div>
          <div class="checkbox-grid" id="scenarioChecklist"></div>
          <div class="row">
            <button class="button button-primary" id="saveScenarioButton">Save enabled scenarios</button>
            <span class="status" id="scenarioStatus"></span>
          </div>
        </article>

        <article class="card span-6 stack" data-tab-panel="tracking">
          <div>
            <h2>Custom Mapping</h2>
            <p class="muted">
              Map raw merchant event names like <code>remove-from-cart</code> or
              <code>breeze_checkout_initiated</code> to canonical scenarios.
            </p>
          </div>
          <div class="mapping-row">
            <div>
              <label for="customSourceName">Raw event name</label>
              <input id="customSourceName" placeholder="remove-from-cart" />
            </div>
            <div>
              <label for="scenarioSelect">Canonical scenario</label>
              <select id="scenarioSelect"></select>
            </div>
            <div>
              <button class="button button-secondary" id="addMappingButton">Add mapping</button>
            </div>
          </div>
          <div class="mapping-list" id="mappingList"></div>
          <div class="row">
            <button class="button button-primary" id="saveMappingsButton">Save mappings</button>
            <span class="status" id="mappingStatus"></span>
          </div>
        </article>

        <article class="card span-6 stack" data-tab-panel="destinations">
          <div>
            <h2>Destinations</h2>
            <p class="muted">
              Configure destination adapters. Meta and GA4 can deliver live with credentials. Google Ads and TikTok
              can also store merchant configuration and payload previews.
            </p>
          </div>
          <div class="stack">
            <div class="scope-grid">
              <div>
                <label for="destinationScopeType">Scope</label>
                <select id="destinationScopeType">
                  <option value="tenant">Tenant Default</option>
                  <option value="domain">Domain Override</option>
                  <option value="market">Market Override</option>
                </select>
              </div>
              <div>
                <label for="destinationDomainSelect">Domain</label>
                <select id="destinationDomainSelect"></select>
              </div>
              <div>
                <label for="destinationMarketSelect">Market</label>
                <select id="destinationMarketSelect"></select>
              </div>
            </div>
            <div class="row">
              <span class="pill" id="destinationScopeBadge">Tenant default</span>
              <button class="button button-secondary" id="resetDestinationScopeButton">Reset selected override</button>
            </div>
            <div class="muted" id="destinationScopeHint">
              Destination configuration can be saved as a tenant default or overridden for a specific domain or market.
            </div>
          </div>
          <div class="destination-list">
            <div class="item destination-card">
              <h3>Meta</h3>
              <div class="row"><input type="checkbox" id="metaEnabled" /> <span class="muted">Enabled</span></div>
              <div class="stack">
                <input id="metaPixelId" placeholder="Pixel ID" />
                <input id="metaAccessToken" placeholder="Access token" />
                <input id="metaTestCode" placeholder="Test event code" />
              </div>
            </div>
            <div class="item destination-card">
              <h3>GA4</h3>
              <div class="row"><input type="checkbox" id="ga4Enabled" /> <span class="muted">Enabled</span></div>
              <div class="stack">
                <input id="ga4MeasurementId" placeholder="Measurement ID" />
                <input id="ga4ApiSecret" placeholder="API secret" />
              </div>
            </div>
            <div class="item destination-card">
              <h3>Google Ads</h3>
              <div class="row"><input type="checkbox" id="googleAdsEnabled" /> <span class="muted">Enabled</span></div>
              <div class="stack">
                <input id="googleAdsCustomerId" placeholder="Customer ID" />
                <input id="googleAdsConversionActionId" placeholder="Conversion action ID" />
                <select id="googleAdsTransport">
                  <option value="preview">Preview</option>
                  <option value="api">API</option>
                </select>
              </div>
            </div>
            <div class="item destination-card">
              <h3>TikTok</h3>
              <div class="row"><input type="checkbox" id="tiktokEnabled" /> <span class="muted">Enabled</span></div>
              <div class="stack">
                <input id="tiktokPixelCode" placeholder="Pixel code" />
                <input id="tiktokAccessToken" placeholder="Access token" />
              </div>
            </div>
          </div>
          <div class="row">
            <button class="button button-primary" id="saveDestinationsButton">Save destinations</button>
            <span class="status" id="destinationStatus"></span>
          </div>
        </article>

        <article class="card span-12 stack is-active" data-tab-panel="overview destinations">
          <div>
            <h2>Recent Delivery Diagnostics</h2>
            <p class="muted">Latest normalized events and destination delivery outcomes.</p>
          </div>
          <div class="event-list" id="eventList"></div>
        </article>

        <article class="card span-12 stack" data-tab-panel="installs">
          <div>
            <h2>Store Installations</h2>
            <p class="muted">
              Every Shopify install is stored in the backend tenant registry. Use this view to confirm which stores have installed,
              what status they are in, and whether the control plane has a real workspace for them.
            </p>
          </div>
          <div class="table-head order-grid">
            <span>Store</span>
            <span>Tenant</span>
            <span>Status</span>
            <span>Scopes</span>
            <span>Installed</span>
          </div>
          <div class="order-list" id="installationList"></div>
        </article>
      </section>
    </main>
    <script>
      let state = {
        overview: null,
        installations: [],
        session: null,
        scenarios: [],
        tenantId: null,
        tenantDetail: null,
        commerceAnalytics: null,
        activeTab: 'overview',
        destinationScopeType: 'tenant',
        destinationDomainHost: null,
        destinationMarketId: null
      };

      async function fetchJson(path, options) {
        const response = await fetch(path, options);
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || 'Request failed');
        }
        return payload;
      }

      async function loadOverview() {
        const [overview, scenarioRegistry, installations, session] = await Promise.all([
          fetchJson('/api/admin/overview'),
          fetchJson('/api/admin/scenarios'),
          fetchJson('/api/admin/installations'),
          fetchJson('/auth/session')
        ]);

        state.overview = overview;
        state.installations = installations;
        state.session = session;
        state.scenarios = scenarioRegistry.scenarios;

        const params = new URLSearchParams(window.location.search);
        const tenantFromUrl = params.get('tenant');
        if (tenantFromUrl) {
          state.tenantId = tenantFromUrl;
        }

        document.getElementById('metricTenants').textContent = overview.summary.tenants;
        document.getElementById('metricEvents').textContent = overview.summary.trackedEvents;
        document.getElementById('metricScenarios').textContent = scenarioRegistry.summary.total;
        document.getElementById('currentUserName').textContent = session.user.displayName;
        document.getElementById('currentUserMeta').textContent = session.user.email + ' • ' + session.user.globalRole.replaceAll('_', ' ');
        document.getElementById('summaryHint').textContent =
          overview.summary.domains + ' domains, ' + overview.summary.markets + ' markets, ' +
          overview.diagnostics.averageQuality + ' average quality score.';

        const tenantSelect = document.getElementById('tenantSelect');
        tenantSelect.innerHTML = overview.tenants.length
          ? overview.tenants.map((tenant) => \`<option value="\${tenant.tenantId}">\${tenant.displayName}</option>\`).join('')
          : '<option value="">No installed shops yet</option>';

        const scenarioSelect = document.getElementById('scenarioSelect');
        scenarioSelect.innerHTML = state.scenarios.map((scenario) => \`<option value="\${scenario.id}">\${scenario.label} (\${scenario.recommendedEventName})</option>\`).join('');

        if (!state.tenantId && overview.tenants.length) {
          state.tenantId = overview.tenants[0].tenantId;
        }
        tenantSelect.value = state.tenantId || '';

        renderRecentEvents(overview.recentEvents || []);
        renderInstallations(state.installations || []);
        applyActiveTab();
        if (!overview.tenants.length) {
          document.getElementById('workspaceStatus').textContent = 'Install the app in a Shopify store to load real domains, markets, and destination scopes.';
          renderEmptyWorkspace();
          return;
        }

        await loadTenantDetail();
      }

      async function loadTenantDetail() {
        if (!state.tenantId) return;

        const [tenantDetail, commerceAnalytics] = await Promise.all([
          fetchJson('/api/admin/tenants/' + state.tenantId),
          fetchJson('/api/admin/analytics/commerce?tenantId=' + encodeURIComponent(state.tenantId))
        ]);
        state.tenantDetail = tenantDetail;
        state.commerceAnalytics = commerceAnalytics;
        const tenant = state.tenantDetail;

        document.getElementById('tenantName').textContent = tenant.displayName;
        document.getElementById('tenantPlan').textContent = tenant.plan ? tenant.plan.name : 'Plan';
        document.getElementById('tenantShop').textContent = tenant.shopDomain;
        document.getElementById('tenantDomains').textContent = tenant.supportedDomains.length + ' domains';
        document.getElementById('tenantMarkets').textContent = tenant.supportedMarkets.length + ' markets';
        document.getElementById('tenantEnabledScenarios').textContent = tenant.tracking.enabledScenarioIds.length + ' scenarios enabled';
        document.getElementById('mappingCount').textContent = tenant.tracking.customEventMappings.length + ' mappings configured';
        document.getElementById('workspaceStatus').textContent = '';

        ensureDestinationScopeState(tenant);
        renderScenarioChecklist(tenant);
        renderMappings(tenant);
        renderDestinationScopeControls(tenant);
        renderDestinations(tenant);
        renderCommerceAnalytics(commerceAnalytics);
      }

      function renderInstallations(installations) {
        const container = document.getElementById('installationList');
        container.innerHTML = installations.length
          ? installations.map((installation) => \`
              <div class="item table-row order-grid">
                <div>
                  <strong>\${escapeHtml(installation.shopDomain)}</strong>
                  <div class="muted">\${installation.accessToken ? 'Offline token stored' : 'Token pending'}</div>
                </div>
                <span>\${escapeHtml(installation.tenantId)}</span>
                <span>\${statusBadge(installation.status)}</span>
                <span>\${escapeHtml((installation.scopes || []).join(', ') || 'No scopes')}</span>
                <span>\${formatDate(installation.installedAt)}</span>
              </div>
            \`).join('')
          : '<div class="item"><strong>No installs yet</strong><div class="muted">Once a Shopify store completes OAuth, it will appear here and be stored in the backend registry.</div></div>';
      }

      function renderEmptyWorkspace() {
        document.getElementById('tenantName').textContent = '--';
        document.getElementById('tenantPlan').textContent = '--';
        document.getElementById('tenantShop').textContent = '--';
        document.getElementById('tenantDomains').textContent = '-- domains';
        document.getElementById('tenantMarkets').textContent = '-- markets';
        document.getElementById('tenantEnabledScenarios').textContent = '-- scenarios enabled';
        document.getElementById('mappingCount').textContent = '0 mappings configured';

        document.getElementById('scenarioChecklist').innerHTML =
          '<div class="item"><strong>No tenant selected</strong><div class="muted">Scenario controls will appear after a Shopify store install is saved in the backend.</div></div>';
        document.getElementById('mappingList').innerHTML =
          '<div class="item"><strong>No tenant selected</strong><div class="muted">Custom event mappings are managed per installed store.</div></div>';
        document.getElementById('destinationScopeType').value = 'tenant';
        document.getElementById('destinationDomainSelect').innerHTML = '<option value="">No domains synced</option>';
        document.getElementById('destinationMarketSelect').innerHTML = '<option value="">No markets synced</option>';
        document.getElementById('destinationDomainSelect').disabled = true;
        document.getElementById('destinationMarketSelect').disabled = true;
        document.getElementById('destinationScopeBadge').textContent = 'No tenant selected';
        document.getElementById('destinationScopeHint').textContent =
          'Destination configuration will appear after the first real Shopify install is stored in the backend.';
        document.getElementById('resetDestinationScopeButton').style.display = 'none';
        document.getElementById('destinationStatus').textContent = '';

        document.getElementById('metaEnabled').checked = false;
        document.getElementById('metaPixelId').value = '';
        document.getElementById('metaAccessToken').value = '';
        document.getElementById('metaTestCode').value = '';
        document.getElementById('ga4Enabled').checked = false;
        document.getElementById('ga4MeasurementId').value = '';
        document.getElementById('ga4ApiSecret').value = '';
        document.getElementById('googleAdsEnabled').checked = false;
        document.getElementById('googleAdsCustomerId').value = '';
        document.getElementById('googleAdsConversionActionId').value = '';
        document.getElementById('googleAdsTransport').value = 'preview';
        document.getElementById('tiktokEnabled').checked = false;
        document.getElementById('tiktokPixelCode').value = '';
        document.getElementById('tiktokAccessToken').value = '';

        renderCommerceAnalytics({
          summary: {},
          destinationBreakdown: [],
          topProducts: [],
          recentPurchases: [],
          orderStatuses: []
        });
      }

      function renderScenarioChecklist(tenant) {
        const enabled = new Set(tenant.tracking.enabledScenarioIds);
        const container = document.getElementById('scenarioChecklist');
        container.innerHTML = state.scenarios.map((scenario) => \`
          <label class="checkbox-item">
            <input type="checkbox" data-scenario-id="\${scenario.id}" \${enabled.has(scenario.id) ? 'checked' : ''} />
            <span>
              <strong>\${scenario.label}</strong><br />
              <span class="muted">\${scenario.category} / \${scenario.source} / \${scenario.recommendedEventName}</span>
            </span>
          </label>
        \`).join('');
      }

      function renderMappings(tenant) {
        const mappingList = document.getElementById('mappingList');
        const mappings = tenant.tracking.customEventMappings || [];

        mappingList.innerHTML = mappings.length
          ? mappings.map((mapping, index) => \`
              <div class="item">
                <div class="row">
                  <strong>\${mapping.sourceName}</strong>
                  <span class="pill">\${mapping.scenarioId}</span>
                  <button class="button button-secondary" data-remove-mapping="\${index}">Remove</button>
                </div>
              </div>
            \`).join('')
          : '<div class="item"><strong>No custom mappings yet</strong><div class="muted">Add a raw dataLayer or iframe event name and map it to a canonical scenario.</div></div>';

        mappingList.querySelectorAll('[data-remove-mapping]').forEach((button) => {
          button.addEventListener('click', () => {
            const index = Number(button.getAttribute('data-remove-mapping'));
            state.tenantDetail.tracking.customEventMappings.splice(index, 1);
            renderMappings(state.tenantDetail);
          });
        });
      }

      function renderDestinations(tenant) {
        const context = resolveDestinationContext(tenant);
        const destinations = context.destinations || {};

        document.getElementById('metaEnabled').checked = !!destinations.meta?.enabled;
        document.getElementById('metaPixelId').value = destinations.meta?.pixelId || '';
        document.getElementById('metaAccessToken').value = destinations.meta?.accessToken || '';
        document.getElementById('metaTestCode').value = destinations.meta?.testEventCode || '';

        document.getElementById('ga4Enabled').checked = !!destinations.ga4?.enabled;
        document.getElementById('ga4MeasurementId').value = destinations.ga4?.measurementId || '';
        document.getElementById('ga4ApiSecret').value = destinations.ga4?.apiSecret || '';

        document.getElementById('googleAdsEnabled').checked = !!destinations.googleAds?.enabled;
        document.getElementById('googleAdsCustomerId').value = destinations.googleAds?.customerId || '';
        document.getElementById('googleAdsConversionActionId').value = destinations.googleAds?.conversionActionId || '';
        document.getElementById('googleAdsTransport').value = destinations.googleAds?.transport || 'preview';

        document.getElementById('tiktokEnabled').checked = !!destinations.tiktok?.enabled;
        document.getElementById('tiktokPixelCode').value = destinations.tiktok?.pixelCode || '';
        document.getElementById('tiktokAccessToken').value = destinations.tiktok?.accessToken || '';
        document.getElementById('destinationScopeBadge').textContent = context.badge;
        document.getElementById('destinationScopeHint').textContent = context.hint;
        document.getElementById('resetDestinationScopeButton').style.display =
          context.scopeType === 'tenant' ? 'none' : 'inline-flex';
      }

      function ensureDestinationScopeState(tenant) {
        if (!state.destinationScopeType) {
          state.destinationScopeType = 'tenant';
        }

        if (!state.destinationDomainHost && tenant.supportedDomains.length) {
          state.destinationDomainHost = tenant.supportedDomains[0].host;
        }

        if (!state.destinationMarketId && tenant.supportedMarkets.length) {
          state.destinationMarketId = tenant.supportedMarkets[0].id;
        }

        if (state.destinationScopeType === 'domain' && !tenant.supportedDomains.length) {
          state.destinationScopeType = 'tenant';
        }

        if (state.destinationScopeType === 'market' && !tenant.supportedMarkets.length) {
          state.destinationScopeType = 'tenant';
        }
      }

      function renderDestinationScopeControls(tenant) {
        const scopeTypeSelect = document.getElementById('destinationScopeType');
        const domainSelect = document.getElementById('destinationDomainSelect');
        const marketSelect = document.getElementById('destinationMarketSelect');

        scopeTypeSelect.value = state.destinationScopeType;
        domainSelect.innerHTML = tenant.supportedDomains.length
          ? tenant.supportedDomains.map((domain) => \`
              <option value="\${domain.host}">
                \${domain.host}\${domain.primary ? ' (primary)' : ''}\${domain.marketId ? ' • ' + domain.marketId : ''}
              </option>
            \`).join('')
          : '<option value="">No domains synced</option>';
        marketSelect.innerHTML = tenant.supportedMarkets.length
          ? tenant.supportedMarkets.map((market) => \`
              <option value="\${market.id}">
                \${market.label} • \${market.currencyCode} • \${market.storefrontDomain}
              </option>
            \`).join('')
          : '<option value="">No markets synced</option>';

        domainSelect.value = state.destinationDomainHost || '';
        marketSelect.value = state.destinationMarketId || '';
        domainSelect.disabled = state.destinationScopeType !== 'domain' || !tenant.supportedDomains.length;
        marketSelect.disabled = state.destinationScopeType !== 'market' || !tenant.supportedMarkets.length;
      }

      function resolveDestinationContext(tenant) {
        const mergedDefault = mergeDestinationConfigs({}, tenant.destinations || {});

        if (state.destinationScopeType === 'domain') {
          const selectedHost = state.destinationDomainHost;
          const override = (tenant.destinationScopes || []).find((entry) =>
            entry.scopeType === 'domain' && entry.scopeId === selectedHost
          );

          return {
            scopeType: 'domain',
            scopeId: selectedHost,
            destinations: mergeDestinationConfigs(mergedDefault, override?.destinations || {}),
            badge: override ? 'Domain override active' : 'Domain inherits tenant default',
            hint: override
              ? 'Saving now updates the selected domain override only.'
              : 'Saving now will create a domain-specific override from the tenant default.'
          };
        }

        if (state.destinationScopeType === 'market') {
          const selectedMarketId = state.destinationMarketId;
          const override = (tenant.destinationScopes || []).find((entry) =>
            entry.scopeType === 'market' && entry.scopeId === selectedMarketId
          );

          return {
            scopeType: 'market',
            scopeId: selectedMarketId,
            destinations: mergeDestinationConfigs(mergedDefault, override?.destinations || {}),
            badge: override ? 'Market override active' : 'Market inherits tenant default',
            hint: override
              ? 'Saving now updates the selected market override only.'
              : 'Saving now will create a market-specific override from the tenant default.'
          };
        }

        return {
          scopeType: 'tenant',
          scopeId: 'tenant',
          destinations: mergedDefault,
          badge: 'Tenant default',
          hint: 'Saving now updates the default destination config used when no domain or market override applies.'
        };
      }

      function renderRecentEvents(events) {
        document.getElementById('eventList').innerHTML = events.length
          ? events.map((event) => {
              const deliveries = Object.entries(event.deliveries || {}).map(([name, result]) => \`\${name}: \${result.status}\`).join(' | ');
              return \`
                <div class="item">
                  <div class="row">
                    <strong>\${event.canonicalEvent}</strong>
                    <span class="pill">\${event.eventName}</span>
                  </div>
                  <div class="muted">\${event.shopDomain} • quality \${event.qualityScore} • \${deliveries || 'no delivery data'}</div>
                </div>
              \`;
            }).join('')
          : '<div class="item"><strong>No events yet</strong><div class="muted">Use the web pixel or theme dataLayer bridge to start ingesting traffic.</div></div>';
      }

      function renderCommerceAnalytics(analytics) {
        renderCommerceSummary(analytics.summary || {});
        renderDestinationBreakdown(analytics.destinationBreakdown || []);
        renderProducts(analytics.topProducts || []);
        renderPurchases(analytics.recentPurchases || []);
        renderOrders(analytics.orderStatuses || []);
      }

      function renderCommerceSummary(summary) {
        const stats = [
          ['Revenue', formatMoney(summary.revenue), 'Tracked purchase value'],
          ['Purchases', summary.purchases || 0, 'Captured purchase events'],
          ['Orders', summary.trackedOrders || 0, 'Unique tracked orders'],
          ['Completion', (summary.checkoutCompletionRate || 0) + '%', 'Purchase to checkout-start rate'],
          ['Product Views', summary.productViews || 0, 'Tracked product views'],
          ['Add To Cart', summary.addToCarts || 0, 'Tracked add-to-cart events'],
          ['AOV', formatMoney(summary.averageOrderValue), 'Average order value'],
          ['Quality', summary.averageQuality || 0, 'Average event quality score']
        ];

        document.getElementById('commerceSummary').innerHTML = stats.map((stat) => \`
          <div class="summary-stat">
            <span class="metric-label">\${stat[0]}</span>
            <strong>\${stat[1]}</strong>
            <div class="muted">\${stat[2]}</div>
          </div>
        \`).join('');
      }

      function renderDestinationBreakdown(rows) {
        document.getElementById('destinationBreakdown').innerHTML = rows.length
          ? rows.map((row) => \`
              <div class="item">
                <div class="row">
                  <strong>\${labelizeDestination(row.destination)}</strong>
                  <span class="pill">Delivered \${row.delivered}</span>
                </div>
                <div class="muted">
                  Failed \${row.failed} • Preview \${row.preview} • Skipped \${row.skipped}
                </div>
              </div>
            \`).join('')
          : '<div class="item"><strong>No purchase deliveries yet</strong><div class="muted">Once purchase events are ingested, destination delivery health will appear here.</div></div>';
      }

      function renderProducts(products) {
        document.getElementById('productList').innerHTML = products.length
          ? products.map((product) => \`
              <div class="item table-row product-grid">
                <div>
                  <strong>\${escapeHtml(product.title || product.productId)}</strong>
                  <div class="muted">\${escapeHtml(product.productId || 'unknown-product')}</div>
                </div>
                <span>\${product.views}</span>
                <span>\${product.addToCarts}</span>
                <span>\${product.purchases}</span>
                <div>
                  <strong>\${formatMoney(product.revenue)}</strong>
                  <div class="muted">Delivered \${product.deliveredPurchases} • Failed \${product.failedPurchases}</div>
                </div>
              </div>
            \`).join('')
          : '<div class="item"><strong>No product analytics yet</strong><div class="muted">Product views, carts, and purchases will populate once traffic begins flowing through the tracker.</div></div>';
      }

      function renderPurchases(purchases) {
        document.getElementById('purchaseList').innerHTML = purchases.length
          ? purchases.map((purchase) => \`
              <div class="item table-row purchase-grid">
                <div>
                  <strong>\${escapeHtml(purchase.orderId)}</strong>
                  <div class="muted">\${formatDate(purchase.occurredAt)}</div>
                </div>
                <span>\${formatMoney(purchase.value)} \${escapeHtml(purchase.currency)}</span>
                <span>\${escapeHtml(purchase.marketId)}</span>
                <span>\${purchase.qualityScore}</span>
                <span>\${statusBadge(deriveDeliveryLabel(purchase.deliveries))}</span>
              </div>
            \`).join('')
          : '<div class="item"><strong>No purchases yet</strong><div class="muted">Purchase events will appear here after checkout completion is tracked.</div></div>';
      }

      function renderOrders(orders) {
        document.getElementById('orderList').innerHTML = orders.length
          ? orders.map((order) => \`
              <div class="item table-row order-grid">
                <div>
                  <strong>\${escapeHtml(order.orderId)}</strong>
                  <div class="muted">\${escapeHtml(order.marketId)} • \${order.items} items</div>
                </div>
                <span>\${escapeHtml(order.timeline.join(' → '))}</span>
                <span>\${formatMoney(order.value)} \${escapeHtml(order.currency)}</span>
                <span>\${statusBadge(order.status)}</span>
                <span>\${formatDate(order.latestAt)}</span>
              </div>
            \`).join('')
          : '<div class="item"><strong>No tracked orders yet</strong><div class="muted">Order-level status appears once checkout and purchase events include an order id.</div></div>';
      }

      function deriveDeliveryLabel(deliveries) {
        const statuses = Object.values(deliveries || {}).map((result) => result.status);
        if (!statuses.length) return 'captured';
        if (statuses.includes('failed')) return 'attention_needed';
        if (statuses.includes('preview')) return 'preview_only';
        if (statuses.includes('skipped')) return 'partially_configured';
        return 'delivered';
      }

      function statusBadge(value) {
        const tone = value === 'delivered'
          ? 'good'
          : value === 'attention_needed' || value === 'failed' || value === 'refunded'
            ? 'bad'
            : 'warn';
        return '<span class="badge badge-' + tone + '">' + escapeHtml(labelizeStatus(value)) + '</span>';
      }

      function labelizeStatus(value) {
        return String(value || 'unknown').replace(/_/g, ' ');
      }

      function labelizeDestination(value) {
        return value === 'ga4'
          ? 'GA4'
          : value === 'googleAds'
            ? 'Google Ads'
            : value === 'tiktok'
              ? 'TikTok'
              : 'Meta';
      }

      function formatMoney(value) {
        const number = Number(value || 0);
        return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(number);
      }

      function formatDate(value) {
        if (!value) return '--';
        try {
          return new Date(value).toLocaleString();
        } catch (_error) {
          return value;
        }
      }

      function applyActiveTab() {
        document.querySelectorAll('[data-tab]').forEach((button) => {
          button.classList.toggle('is-active', button.getAttribute('data-tab') === state.activeTab);
        });

        document.querySelectorAll('[data-tab-panel]').forEach((panel) => {
          const tabs = (panel.getAttribute('data-tab-panel') || '').split(/\s+/).filter(Boolean);
          panel.classList.toggle('is-active', tabs.includes(state.activeTab));
        });
      }

      function escapeHtml(value) {
        return String(value ?? '')
          .replaceAll('&', '&amp;')
          .replaceAll('<', '&lt;')
          .replaceAll('>', '&gt;')
          .replaceAll('"', '&quot;')
          .replaceAll("'", '&#39;');
      }

      function collectEnabledScenarioIds() {
        return [...document.querySelectorAll('[data-scenario-id]:checked')].map((input) => input.getAttribute('data-scenario-id'));
      }

      function mergeDestinationConfigs(current, incoming) {
        return {
          ...current,
          ...incoming,
          meta: incoming.meta ? { ...(current.meta || {}), ...incoming.meta } : current.meta,
          ga4: incoming.ga4 ? { ...(current.ga4 || {}), ...incoming.ga4 } : current.ga4,
          googleAds: incoming.googleAds ? { ...(current.googleAds || {}), ...incoming.googleAds } : current.googleAds,
          tiktok: incoming.tiktok ? { ...(current.tiktok || {}), ...incoming.tiktok } : current.tiktok
        };
      }

      async function saveTracking() {
        const payload = {
          enabledScenarioIds: collectEnabledScenarioIds(),
          customEventMappings: state.tenantDetail.tracking.customEventMappings
        };

        state.tenantDetail = await fetchJson('/api/admin/tenants/' + state.tenantId + '/tracking', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        document.getElementById('scenarioStatus').textContent = 'Scenario settings saved.';
        document.getElementById('mappingStatus').textContent = 'Mappings persisted with tracking settings.';
        await loadOverview();
      }

      async function saveDestinations() {
        const payload = {
          meta: {
            enabled: document.getElementById('metaEnabled').checked,
            pixelId: document.getElementById('metaPixelId').value,
            accessToken: document.getElementById('metaAccessToken').value,
            testEventCode: document.getElementById('metaTestCode').value || undefined
          },
          ga4: {
            enabled: document.getElementById('ga4Enabled').checked,
            measurementId: document.getElementById('ga4MeasurementId').value,
            apiSecret: document.getElementById('ga4ApiSecret').value
          },
          googleAds: {
            enabled: document.getElementById('googleAdsEnabled').checked,
            customerId: document.getElementById('googleAdsCustomerId').value,
            conversionActionId: document.getElementById('googleAdsConversionActionId').value,
            transport: document.getElementById('googleAdsTransport').value
          },
          tiktok: {
            enabled: document.getElementById('tiktokEnabled').checked,
            pixelCode: document.getElementById('tiktokPixelCode').value,
            accessToken: document.getElementById('tiktokAccessToken').value || undefined
          }
        };

        if (state.destinationScopeType === 'tenant') {
          state.tenantDetail = await fetchJson('/api/admin/tenants/' + state.tenantId + '/destinations', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } else if (state.destinationScopeType === 'domain') {
          state.tenantDetail = await fetchJson('/api/admin/tenants/' + state.tenantId + '/destination-scopes', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              scopeType: 'domain',
              scopeId: state.destinationDomainHost,
              label: state.destinationDomainHost,
              domainHost: state.destinationDomainHost,
              destinations: payload
            })
          });
        } else {
          const selectedMarket = state.tenantDetail.supportedMarkets.find((market) => market.id === state.destinationMarketId);
          state.tenantDetail = await fetchJson('/api/admin/tenants/' + state.tenantId + '/destination-scopes', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              scopeType: 'market',
              scopeId: state.destinationMarketId,
              label: selectedMarket ? selectedMarket.label : state.destinationMarketId,
              marketId: state.destinationMarketId,
              destinations: payload
            })
          });
        }

        renderDestinationScopeControls(state.tenantDetail);
        renderDestinations(state.tenantDetail);
        document.getElementById('destinationStatus').textContent = state.destinationScopeType === 'tenant'
          ? 'Tenant default destinations saved.'
          : 'Scoped destination override saved.';
        await loadOverview();
      }

      async function resetDestinationScope() {
        if (state.destinationScopeType === 'tenant') {
          document.getElementById('destinationStatus').textContent = 'Tenant default cannot be reset.';
          return;
        }

        const scopeId = state.destinationScopeType === 'domain'
          ? state.destinationDomainHost
          : state.destinationMarketId;

        if (!scopeId) {
          document.getElementById('destinationStatus').textContent = 'Choose a domain or market first.';
          return;
        }

        state.tenantDetail = await fetchJson(
          '/api/admin/tenants/' + state.tenantId + '/destination-scopes?scopeType=' + encodeURIComponent(state.destinationScopeType) + '&scopeId=' + encodeURIComponent(scopeId),
          { method: 'DELETE' }
        );

        renderDestinationScopeControls(state.tenantDetail);
        renderDestinations(state.tenantDetail);
        document.getElementById('destinationStatus').textContent = 'Selected override reset to tenant default.';
        await loadOverview();
      }

      function addMapping() {
        const sourceName = document.getElementById('customSourceName').value.trim();
        const scenarioId = document.getElementById('scenarioSelect').value;
        if (!sourceName || !scenarioId) {
          document.getElementById('mappingStatus').textContent = 'Enter a raw event name and choose a scenario.';
          return;
        }

        state.tenantDetail.tracking.customEventMappings.push({
          sourceName,
          scenarioId,
          enabled: true
        });
        document.getElementById('customSourceName').value = '';
        document.getElementById('mappingStatus').textContent = 'Mapping added locally. Save mappings to persist.';
        renderMappings(state.tenantDetail);
      }

      async function createInstallLink() {
        const shop = prompt('Enter a myshopify shop domain', 'demo-shop.myshopify.com');
        if (!shop) return;

        try {
          const payload = await fetchJson('/api/admin/onboarding/install-link?shop=' + encodeURIComponent(shop));
          await navigator.clipboard.writeText(payload.installUrl);
          document.getElementById('workspaceStatus').textContent = 'Install URL copied to clipboard.';
        } catch (error) {
          document.getElementById('workspaceStatus').textContent = error.message;
        }
      }

      document.getElementById('refreshButton').addEventListener('click', loadOverview);
      document.getElementById('copyInstallLinkButton').addEventListener('click', createInstallLink);
      document.querySelectorAll('[data-tab]').forEach((button) => {
        button.addEventListener('click', () => {
          state.activeTab = button.getAttribute('data-tab');
          applyActiveTab();
        });
      });
      document.getElementById('tenantSelect').addEventListener('change', async (event) => {
        state.tenantId = event.target.value;
        await loadTenantDetail();
      });
      document.getElementById('destinationScopeType').addEventListener('change', (event) => {
        state.destinationScopeType = event.target.value;
        renderDestinationScopeControls(state.tenantDetail);
        renderDestinations(state.tenantDetail);
      });
      document.getElementById('destinationDomainSelect').addEventListener('change', (event) => {
        state.destinationDomainHost = event.target.value;
        renderDestinations(state.tenantDetail);
      });
      document.getElementById('destinationMarketSelect').addEventListener('change', (event) => {
        state.destinationMarketId = event.target.value;
        renderDestinations(state.tenantDetail);
      });
      document.getElementById('saveScenarioButton').addEventListener('click', saveTracking);
      document.getElementById('saveMappingsButton').addEventListener('click', saveTracking);
      document.getElementById('saveDestinationsButton').addEventListener('click', saveDestinations);
      document.getElementById('resetDestinationScopeButton').addEventListener('click', resetDestinationScope);
      document.getElementById('addMappingButton').addEventListener('click', addMapping);

      loadOverview().catch((error) => {
        document.getElementById('workspaceStatus').textContent = error.message;
      });
    </script>
  </body>
</html>`;
}
