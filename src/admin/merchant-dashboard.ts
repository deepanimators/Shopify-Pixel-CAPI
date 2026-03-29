export function renderMerchantDashboard() {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AdTrace Merchant Workspace</title>
    <style>
      :root {
        --bg: #f4f1ea;
        --panel: rgba(255,255,255,0.92);
        --line: rgba(36, 29, 23, 0.1);
        --text: #211912;
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
        max-width: 1280px;
        margin: 0 auto;
        padding: 24px 18px 56px;
      }
      .hero,
      .grid {
        display: grid;
        gap: 18px;
      }
      .hero {
        grid-template-columns: 1.2fr 0.8fr;
      }
      .grid {
        grid-template-columns: repeat(12, minmax(0, 1fr));
        margin-top: 18px;
      }
      .card {
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 24px;
        box-shadow: var(--shadow);
        padding: 22px;
      }
      .span-4 { grid-column: span 4; }
      .span-5 { grid-column: span 5; }
      .span-6 { grid-column: span 6; }
      .span-7 { grid-column: span 7; }
      .span-8 { grid-column: span 8; }
      .span-12 { grid-column: span 12; }
      .eyebrow {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        color: var(--accent);
        font-weight: 700;
      }
      h1, h2, h3, p { margin-top: 0; }
      h1 {
        font-size: clamp(2rem, 3.8vw, 4rem);
        line-height: 0.96;
        margin: 14px 0 18px;
        font-family: "Iowan Old Style", "Palatino Linotype", serif;
      }
      h2 {
        font-size: 1.3rem;
        margin-bottom: 8px;
        font-family: "Iowan Old Style", "Palatino Linotype", serif;
      }
      .muted {
        color: var(--muted);
        line-height: 1.6;
      }
      .row,
      .tab-bar,
      .metric-strip {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
      }
      .metric-strip { margin-top: 16px; }
      .metric {
        min-width: 150px;
        padding: 14px 16px;
        border-radius: 18px;
        border: 1px solid var(--line);
        background: rgba(255,255,255,0.74);
      }
      .metric-label {
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 11px;
        font-weight: 700;
      }
      .metric-value {
        margin-top: 8px;
        font-size: 1.8rem;
      }
      .button {
        border: 0;
        border-radius: 999px;
        padding: 12px 16px;
        font-weight: 700;
        cursor: pointer;
      }
      .button-primary {
        background: var(--text);
        color: #fff;
      }
      .button-secondary {
        background: var(--accent-soft);
        color: var(--accent);
      }
      .tab-button {
        background: rgba(255,255,255,0.8);
        color: var(--muted);
        border: 1px solid var(--line);
      }
      .tab-button.is-active {
        background: var(--text);
        color: white;
      }
      [data-tab-panel] { display: none; }
      [data-tab-panel].is-active { display: grid; }
      label {
        display: block;
        margin-bottom: 8px;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--muted);
        font-weight: 700;
      }
      input, select, textarea {
        width: 100%;
        border-radius: 14px;
        border: 1px solid var(--line);
        background: rgba(255,255,255,0.86);
        padding: 12px 14px;
        color: var(--text);
        font: inherit;
      }
      .stack,
      .summary-grid,
      .list {
        display: grid;
        gap: 12px;
      }
      .summary-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
      .summary-stat,
      .item {
        border: 1px solid var(--line);
        border-radius: 18px;
        padding: 14px;
        background: rgba(255,255,255,0.72);
      }
      .summary-stat strong {
        display: block;
        margin-top: 6px;
        font-size: 1.45rem;
      }
      .pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        padding: 6px 10px;
        background: rgba(11,107,92,0.12);
        color: var(--accent);
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      .checkbox-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        max-height: 420px;
        overflow: auto;
      }
      .checkbox-item {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        padding: 10px 12px;
        border: 1px solid var(--line);
        border-radius: 16px;
        background: rgba(255,255,255,0.72);
      }
      .checkbox-item input { width: auto; margin-top: 2px; }
      .mapping-row,
      .scope-grid,
      .table-head,
      .table-row {
        display: grid;
        gap: 10px;
        align-items: center;
      }
      .mapping-row {
        grid-template-columns: 1.1fr 1.2fr auto;
      }
      .scope-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .product-grid,
      .purchase-grid {
        grid-template-columns: 1.8fr 0.8fr 0.8fr 0.8fr 0.8fr;
      }
      .order-grid {
        grid-template-columns: 1.3fr 0.9fr 0.9fr 1.2fr 0.8fr;
      }
      .table-head {
        color: var(--muted);
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-weight: 700;
      }
      .status {
        min-height: 18px;
        color: var(--accent);
        font-size: 12px;
        font-weight: 700;
      }
      @media (max-width: 1080px) {
        .hero, .grid { grid-template-columns: 1fr; }
        .span-4, .span-5, .span-6, .span-7, .span-8, .span-12 { grid-column: auto; }
        .summary-grid, .product-grid, .purchase-grid, .order-grid, .mapping-row, .scope-grid, .checkbox-grid {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <section class="hero">
        <article class="card">
          <div class="eyebrow">Merchant Workspace</div>
          <h1>Manage tracking, destinations, and diagnostics for this Shopify store.</h1>
          <p class="muted" id="heroHint">
            Open this app from Shopify Admin to load the connected merchant workspace and manage market-aware tracking without leaving the store.
          </p>
          <div class="row">
            <button class="button button-primary" id="refreshButton">Refresh workspace</button>
            <span class="pill" id="merchantShopBadge">Waiting for store context</span>
          </div>
        </article>
        <aside class="card">
          <div class="metric-strip">
            <div class="metric">
              <div class="metric-label">Domains</div>
              <div class="metric-value" id="metricDomains">--</div>
            </div>
            <div class="metric">
              <div class="metric-label">Markets</div>
              <div class="metric-value" id="metricMarkets">--</div>
            </div>
            <div class="metric">
              <div class="metric-label">Tracked Events</div>
              <div class="metric-value" id="metricEvents">--</div>
            </div>
          </div>
          <p class="muted" id="merchantSummaryHint">Loading connected workspace.</p>
        </aside>
      </section>

      <section class="card" style="margin-top: 18px;">
        <div class="tab-bar">
          <button class="button tab-button is-active" data-tab="overview">Overview</button>
          <button class="button tab-button" data-tab="commerce">Commerce</button>
          <button class="button tab-button" data-tab="tracking">Tracking</button>
          <button class="button tab-button" data-tab="destinations">Destinations</button>
        </div>
      </section>

      <section class="grid">
        <article class="card span-4 stack is-active" data-tab-panel="overview">
          <div>
            <h2>Connected Store</h2>
            <p class="muted">Merchant workspace details loaded from the Shopify store context.</p>
          </div>
          <div class="item">
            <div class="row">
              <strong id="tenantName">--</strong>
              <span class="pill" id="tenantPlan">--</span>
            </div>
            <div class="muted" id="tenantShop">--</div>
          </div>
          <div class="item">
            <strong>Coverage</strong>
            <div class="muted" id="coverageHint">Waiting for market and domain sync.</div>
          </div>
          <div class="status" id="workspaceStatus"></div>
        </article>

        <article class="card span-8 stack is-active" data-tab-panel="overview commerce">
          <div>
            <h2>Commerce Pulse</h2>
            <p class="muted">Review purchases, order coverage, and delivery health for this store.</p>
          </div>
          <div class="summary-grid" id="commerceSummary"></div>
          <div class="list" id="destinationBreakdown"></div>
        </article>

        <article class="card span-6 stack" data-tab-panel="commerce">
          <div>
            <h2>Top Products</h2>
            <p class="muted">See which products are being viewed, added to cart, and purchased.</p>
          </div>
          <div class="table-head product-grid">
            <span>Product</span>
            <span>Views</span>
            <span>Adds</span>
            <span>Purchases</span>
            <span>Revenue</span>
          </div>
          <div class="list" id="productList"></div>
        </article>

        <article class="card span-6 stack" data-tab-panel="commerce">
          <div>
            <h2>Recent Purchases</h2>
            <p class="muted">Recent order events and destination delivery status for this store.</p>
          </div>
          <div class="table-head purchase-grid">
            <span>Order</span>
            <span>Value</span>
            <span>Market</span>
            <span>Quality</span>
            <span>Status</span>
          </div>
          <div class="list" id="purchaseList"></div>
        </article>

        <article class="card span-12 stack" data-tab-panel="commerce">
          <div>
            <h2>Order Tracking Status</h2>
            <p class="muted">Track checkout progression and purchase delivery health by order.</p>
          </div>
          <div class="table-head order-grid">
            <span>Order</span>
            <span>Timeline</span>
            <span>Value</span>
            <span>Tracking</span>
            <span>Updated</span>
          </div>
          <div class="list" id="orderList"></div>
        </article>

        <article class="card span-7 stack" data-tab-panel="tracking">
          <div>
            <h2>Scenario Manager</h2>
            <p class="muted">Enable the event journeys this store actually uses.</p>
          </div>
          <div class="checkbox-grid" id="scenarioChecklist"></div>
          <div class="row">
            <button class="button button-primary" id="saveScenarioButton">Save scenarios</button>
            <span class="status" id="scenarioStatus"></span>
          </div>
        </article>

        <article class="card span-5 stack" data-tab-panel="tracking">
          <div>
            <h2>Custom Event Mapping</h2>
            <p class="muted">Map custom checkout or dataLayer event names into canonical scenarios.</p>
          </div>
          <div class="mapping-row">
            <div>
              <label for="customSourceName">Raw event name</label>
              <input id="customSourceName" placeholder="breeze_purchase" />
            </div>
            <div>
              <label for="scenarioSelect">Canonical scenario</label>
              <select id="scenarioSelect"></select>
            </div>
            <div>
              <button class="button button-secondary" id="addMappingButton">Add</button>
            </div>
          </div>
          <div class="list" id="mappingList"></div>
          <div class="row">
            <button class="button button-primary" id="saveMappingsButton">Save mappings</button>
            <span class="status" id="mappingStatus"></span>
          </div>
        </article>

        <article class="card span-6 stack" data-tab-panel="destinations">
          <div>
            <h2>Destination Settings</h2>
            <p class="muted">Manage the store default and scoped market or domain overrides.</p>
          </div>
          <div class="scope-grid">
            <div>
              <label for="destinationScopeType">Scope</label>
              <select id="destinationScopeType">
                <option value="tenant">Store Default</option>
                <option value="domain">Domain Override</option>
                <option value="market">Market Override</option>
              </select>
            </div>
            <div>
              <label for="destinationScopeSelect">Domain or Market</label>
              <select id="destinationScopeSelect"></select>
            </div>
          </div>
          <div class="row">
            <span class="pill" id="destinationScopeBadge">Store default</span>
            <button class="button button-secondary" id="resetDestinationScopeButton">Reset override</button>
          </div>
          <div class="stack">
            <div class="item">
              <h3>Meta</h3>
              <div class="row"><input type="checkbox" id="metaEnabled" /> <span class="muted">Enabled</span></div>
              <div class="stack">
                <input id="metaPixelId" placeholder="Pixel ID" />
                <input id="metaAccessToken" placeholder="Access token" />
                <input id="metaTestCode" placeholder="Test event code" />
              </div>
            </div>
            <div class="item">
              <h3>GA4</h3>
              <div class="row"><input type="checkbox" id="ga4Enabled" /> <span class="muted">Enabled</span></div>
              <div class="stack">
                <input id="ga4MeasurementId" placeholder="Measurement ID" />
                <input id="ga4ApiSecret" placeholder="API secret" />
              </div>
            </div>
            <div class="item">
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
            <div class="item">
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
      </section>
    </main>
    <script>
      const params = new URLSearchParams(window.location.search);
      const shop = params.get('shop');

      let state = {
        shop,
        workspace: null,
        activeTab: 'overview',
        destinationScopeType: 'tenant',
        destinationScopeId: ''
      };

      async function fetchJson(path, options) {
        const response = await fetch(path, options);
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || 'Request failed');
        }
        return payload;
      }

      function apiPath(path) {
        const url = new URL(path, window.location.origin);
        if (state.shop) {
          url.searchParams.set('shop', state.shop);
        }
        return url.pathname + url.search;
      }

      async function loadWorkspace() {
        if (!state.shop) {
          document.getElementById('workspaceStatus').textContent = 'Open this app from Shopify Admin so the store context is available.';
          return;
        }

        const workspace = await fetchJson(apiPath('/api/app/workspace'));
        state.workspace = workspace;
        document.getElementById('merchantShopBadge').textContent = workspace.shopDomain;
        document.getElementById('tenantName').textContent = workspace.displayName;
        document.getElementById('tenantPlan').textContent = workspace.plan ? workspace.plan.name : 'Plan';
        document.getElementById('tenantShop').textContent = workspace.shopDomain;
        document.getElementById('metricDomains').textContent = workspace.supportedDomains.length;
        document.getElementById('metricMarkets').textContent = workspace.supportedMarkets.length;
        document.getElementById('metricEvents').textContent = workspace.eventCount;
        document.getElementById('merchantSummaryHint').textContent =
          workspace.supportedDomains.length + ' domains • ' +
          workspace.supportedMarkets.length + ' markets • ' +
          workspace.tracking.enabledScenarioIds.length + ' scenarios enabled';
        document.getElementById('coverageHint').textContent =
          workspace.supportedDomains.map((domain) => domain.host).join(', ') || 'No domains synced yet.';

        renderScenarios();
        renderMappings();
        renderDestinationSelectors();
        renderDestinations();
        renderCommerce(workspace.commerceAnalytics);
      }

      function renderScenarios() {
        const enabled = new Set(state.workspace.tracking.enabledScenarioIds);
        document.getElementById('scenarioChecklist').innerHTML = state.workspace.scenarios.map((scenario) => \`
          <label class="checkbox-item">
            <input type="checkbox" data-scenario-id="\${scenario.id}" \${enabled.has(scenario.id) ? 'checked' : ''} />
            <span>
              <strong>\${scenario.label}</strong><br />
              <span class="muted">\${scenario.category} / \${scenario.source} / \${scenario.recommendedEventName}</span>
            </span>
          </label>
        \`).join('');

        document.getElementById('scenarioSelect').innerHTML = state.workspace.scenarios
          .map((scenario) => \`<option value="\${scenario.id}">\${scenario.label} (\${scenario.recommendedEventName})</option>\`)
          .join('');
      }

      function renderMappings() {
        const mappings = state.workspace.tracking.customEventMappings || [];
        const list = document.getElementById('mappingList');

        list.innerHTML = mappings.length
          ? mappings.map((mapping, index) => \`
              <div class="item">
                <div class="row">
                  <strong>\${mapping.sourceName}</strong>
                  <span class="pill">\${mapping.scenarioId}</span>
                  <button class="button button-secondary" data-remove-mapping="\${index}">Remove</button>
                </div>
              </div>
            \`).join('')
          : '<div class="item"><strong>No custom mappings yet</strong><div class="muted">Add custom event names from your checkout or storefront dataLayer.</div></div>';

        list.querySelectorAll('[data-remove-mapping]').forEach((button) => {
          button.addEventListener('click', () => {
            const index = Number(button.getAttribute('data-remove-mapping'));
            state.workspace.tracking.customEventMappings.splice(index, 1);
            renderMappings();
          });
        });
      }

      function renderDestinationSelectors() {
        const select = document.getElementById('destinationScopeSelect');
        const domains = state.workspace.supportedDomains.map((domain) => ({
          value: domain.host,
          label: 'Domain • ' + domain.host
        }));
        const markets = state.workspace.supportedMarkets.map((market) => ({
          value: market.id,
          label: 'Market • ' + market.label
        }));
        const options = state.destinationScopeType === 'domain' ? domains : markets;

        select.innerHTML = state.destinationScopeType === 'tenant'
          ? '<option value="">Store default</option>'
          : (options.length
            ? options.map((entry) => \`<option value="\${entry.value}">\${entry.label}</option>\`).join('')
            : '<option value="">No scoped options available</option>');

        select.disabled = state.destinationScopeType === 'tenant' || !options.length;

        if (state.destinationScopeType === 'tenant') {
          state.destinationScopeId = '';
        } else if (!state.destinationScopeId || !options.some((entry) => entry.value === state.destinationScopeId)) {
          state.destinationScopeId = options[0] ? options[0].value : '';
        }

        select.value = state.destinationScopeId;
      }

      function currentScopeContext() {
        if (state.destinationScopeType === 'tenant') {
          return {
            badge: 'Store default',
            destinations: state.workspace.destinations || {},
            scopeType: 'tenant'
          };
        }

        const scope = (state.workspace.destinationScopes || []).find((entry) =>
          entry.scopeType === state.destinationScopeType && entry.scopeId === state.destinationScopeId
        );

        if (!scope) {
          return {
            badge: state.destinationScopeType === 'domain' ? 'Domain override (new)' : 'Market override (new)',
            destinations: {},
            scopeType: state.destinationScopeType
          };
        }

        return {
          badge: scope.label,
          destinations: scope.destinations || {},
          scopeType: scope.scopeType
        };
      }

      function renderDestinations() {
        const context = currentScopeContext();
        const destinations = context.destinations || {};
        document.getElementById('destinationScopeBadge').textContent = context.badge;
        document.getElementById('resetDestinationScopeButton').style.display =
          state.destinationScopeType === 'tenant' ? 'none' : 'inline-flex';

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
      }

      function renderCommerce(analytics) {
        const summary = analytics?.summary || {};
        document.getElementById('commerceSummary').innerHTML = [
          ['Revenue', formatCurrency(summary.revenue || 0)],
          ['Purchases', summary.purchases || 0],
          ['Orders', summary.trackedOrders || 0],
          ['Completion', (summary.checkoutCompletionRate || 0) + '%'],
          ['Product Views', summary.productViews || 0],
          ['Add To Cart', summary.addToCarts || 0],
          ['AOV', formatCurrency(summary.averageOrderValue || 0)],
          ['Quality', summary.averageQuality || 0]
        ].map(([label, value]) => \`
          <div class="summary-stat">
            <span class="muted">\${label}</span>
            <strong>\${value}</strong>
          </div>
        \`).join('');

        document.getElementById('destinationBreakdown').innerHTML = (analytics?.destinationBreakdown || []).length
          ? analytics.destinationBreakdown.map((entry) => \`
              <div class="item">
                <strong>\${entry.destination}</strong>
                <div class="muted">Delivered: \${entry.delivered} • Failed: \${entry.failed} • Skipped: \${entry.skipped} • Preview: \${entry.preview}</div>
              </div>
            \`).join('')
          : '<div class="item"><strong>No purchase deliveries yet</strong><div class="muted">Destination delivery health will appear once purchase events are ingested.</div></div>';

        document.getElementById('productList').innerHTML = (analytics?.topProducts || []).length
          ? analytics.topProducts.map((product) => \`
              <div class="item table-row product-grid">
                <strong>\${escapeHtml(product.title)}</strong>
                <span>\${product.views}</span>
                <span>\${product.addToCarts}</span>
                <span>\${product.purchases}</span>
                <span>\${formatCurrency(product.revenue)}</span>
              </div>
            \`).join('')
          : '<div class="item"><strong>No product analytics yet</strong><div class="muted">Product views, carts, and purchases will populate once traffic starts flowing.</div></div>';

        document.getElementById('purchaseList').innerHTML = (analytics?.recentPurchases || []).length
          ? analytics.recentPurchases.map((purchase) => \`
              <div class="item table-row purchase-grid">
                <div><strong>\${escapeHtml(purchase.orderId)}</strong><div class="muted">\${escapeHtml(purchase.domain)}</div></div>
                <span>\${formatCurrency(purchase.value)} \${escapeHtml(purchase.currency)}</span>
                <span>\${escapeHtml(purchase.marketId)}</span>
                <span>\${purchase.qualityScore}</span>
                <span>\${deliveryBadge(purchase.deliveries)}</span>
              </div>
            \`).join('')
          : '<div class="item"><strong>No purchases yet</strong><div class="muted">Purchase events will appear here after checkout completion is tracked.</div></div>';

        document.getElementById('orderList').innerHTML = (analytics?.orderStatuses || []).length
          ? analytics.orderStatuses.map((order) => \`
              <div class="item table-row order-grid">
                <div><strong>\${escapeHtml(order.orderId)}</strong><div class="muted">\${escapeHtml(order.domain)}</div></div>
                <span>\${order.timeline.length} steps</span>
                <span>\${formatCurrency(order.value)} \${escapeHtml(order.currency)}</span>
                <span>\${order.purchaseDelivered ? 'Delivered' : 'Pending'}</span>
                <span>\${formatDate(order.updatedAt)}</span>
              </div>
            \`).join('')
          : '<div class="item"><strong>No tracked orders yet</strong><div class="muted">Order-level status appears once checkout and purchase events include an order id.</div></div>';
      }

      function collectDestinations() {
        return {
          meta: {
            enabled: document.getElementById('metaEnabled').checked,
            pixelId: document.getElementById('metaPixelId').value.trim(),
            accessToken: document.getElementById('metaAccessToken').value.trim(),
            testEventCode: document.getElementById('metaTestCode').value.trim() || undefined
          },
          ga4: {
            enabled: document.getElementById('ga4Enabled').checked,
            measurementId: document.getElementById('ga4MeasurementId').value.trim(),
            apiSecret: document.getElementById('ga4ApiSecret').value.trim()
          },
          googleAds: {
            enabled: document.getElementById('googleAdsEnabled').checked,
            customerId: document.getElementById('googleAdsCustomerId').value.trim(),
            conversionActionId: document.getElementById('googleAdsConversionActionId').value.trim(),
            transport: document.getElementById('googleAdsTransport').value
          },
          tiktok: {
            enabled: document.getElementById('tiktokEnabled').checked,
            pixelCode: document.getElementById('tiktokPixelCode').value.trim(),
            accessToken: document.getElementById('tiktokAccessToken').value.trim() || undefined
          }
        };
      }

      async function saveScenarios() {
        const enabledScenarioIds = [...document.querySelectorAll('[data-scenario-id]:checked')]
          .map((input) => input.getAttribute('data-scenario-id'));
        state.workspace.tracking.enabledScenarioIds = enabledScenarioIds;
        await fetchJson(apiPath('/api/app/tracking'), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(state.workspace.tracking)
        });
        document.getElementById('scenarioStatus').textContent = 'Scenarios saved.';
      }

      async function saveMappings() {
        await fetchJson(apiPath('/api/app/tracking'), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(state.workspace.tracking)
        });
        document.getElementById('mappingStatus').textContent = 'Mappings saved.';
      }

      async function saveDestinations() {
        const destinations = collectDestinations();
        if (state.destinationScopeType === 'tenant') {
          state.workspace = await fetchJson(apiPath('/api/app/destinations'), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(destinations)
          });
        } else {
          const label = state.destinationScopeType === 'domain'
            ? 'Domain • ' + state.destinationScopeId
            : 'Market • ' + (state.workspace.supportedMarkets.find((market) => market.id === state.destinationScopeId)?.label || state.destinationScopeId);

          state.workspace = await fetchJson(apiPath('/api/app/destination-scopes'), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              scopeType: state.destinationScopeType,
              scopeId: state.destinationScopeId,
              label,
              domainHost: state.destinationScopeType === 'domain' ? state.destinationScopeId : undefined,
              marketId: state.destinationScopeType === 'market' ? state.destinationScopeId : undefined,
              destinations
            })
          });
        }

        renderDestinationSelectors();
        renderDestinations();
        document.getElementById('destinationStatus').textContent = 'Destination settings saved.';
      }

      async function resetDestinationScope() {
        if (state.destinationScopeType === 'tenant' || !state.destinationScopeId) {
          return;
        }

        state.workspace = await fetchJson(apiPath('/api/app/destination-scopes?scopeType=' + encodeURIComponent(state.destinationScopeType) + '&scopeId=' + encodeURIComponent(state.destinationScopeId)), {
          method: 'DELETE'
        });
        renderDestinationSelectors();
        renderDestinations();
        document.getElementById('destinationStatus').textContent = 'Override removed.';
      }

      function addMapping() {
        const sourceName = document.getElementById('customSourceName').value.trim();
        const scenarioId = document.getElementById('scenarioSelect').value;
        if (!sourceName || !scenarioId) {
          document.getElementById('mappingStatus').textContent = 'Add a raw event name and scenario.';
          return;
        }

        const existing = (state.workspace.tracking.customEventMappings || []).find((mapping) => mapping.sourceName === sourceName);
        if (existing) {
          existing.scenarioId = scenarioId;
          existing.enabled = true;
        } else {
          state.workspace.tracking.customEventMappings.push({ sourceName, scenarioId, enabled: true });
        }
        document.getElementById('customSourceName').value = '';
        renderMappings();
        document.getElementById('mappingStatus').textContent = 'Mapping added locally. Save mappings to persist.';
      }

      function applyActiveTab() {
        document.querySelectorAll('[data-tab]').forEach((button) => {
          button.classList.toggle('is-active', button.getAttribute('data-tab') === state.activeTab);
        });
        document.querySelectorAll('[data-tab-panel]').forEach((panel) => {
          const tabs = (panel.getAttribute('data-tab-panel') || '').split(' ');
          panel.classList.toggle('is-active', tabs.includes(state.activeTab));
        });
      }

      function deliveryBadge(deliveries) {
        const statuses = Object.values(deliveries || {});
        if (!statuses.length) return 'No delivery';
        if (statuses.some((entry) => entry.status === 'failed')) return 'Needs attention';
        if (statuses.every((entry) => entry.status === 'delivered')) return 'Delivered';
        if (statuses.some((entry) => entry.status === 'preview')) return 'Preview';
        return statuses[0].status;
      }

      function formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0
        }).format(Number(value || 0));
      }

      function formatDate(value) {
        return value ? new Date(value).toLocaleString() : '--';
      }

      function escapeHtml(value) {
        return String(value)
          .replaceAll('&', '&amp;')
          .replaceAll('<', '&lt;')
          .replaceAll('>', '&gt;')
          .replaceAll('"', '&quot;')
          .replaceAll("'", '&#39;');
      }

      document.querySelectorAll('[data-tab]').forEach((button) => {
        button.addEventListener('click', () => {
          state.activeTab = button.getAttribute('data-tab');
          applyActiveTab();
        });
      });

      document.getElementById('refreshButton').addEventListener('click', loadWorkspace);
      document.getElementById('saveScenarioButton').addEventListener('click', saveScenarios);
      document.getElementById('saveMappingsButton').addEventListener('click', saveMappings);
      document.getElementById('addMappingButton').addEventListener('click', addMapping);
      document.getElementById('saveDestinationsButton').addEventListener('click', saveDestinations);
      document.getElementById('resetDestinationScopeButton').addEventListener('click', resetDestinationScope);
      document.getElementById('destinationScopeType').addEventListener('change', (event) => {
        state.destinationScopeType = event.target.value;
        state.destinationScopeId = '';
        renderDestinationSelectors();
        renderDestinations();
      });
      document.getElementById('destinationScopeSelect').addEventListener('change', (event) => {
        state.destinationScopeId = event.target.value;
        renderDestinations();
      });

      applyActiveTab();
      loadWorkspace().catch((error) => {
        document.getElementById('workspaceStatus').textContent = error.message || 'Unable to load merchant workspace.';
      });
    </script>
  </body>
</html>`;
}
