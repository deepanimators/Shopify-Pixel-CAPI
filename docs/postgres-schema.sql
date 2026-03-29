create table if not exists tenants (
  tenant_id text primary key,
  display_name text not null,
  shop_domain text not null unique,
  plan_id text not null,
  status text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table if not exists app_users (
  user_id text primary key,
  email text not null unique,
  display_name text not null,
  global_role text not null,
  status text not null,
  password_hash text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table if not exists app_sessions (
  session_token text primary key,
  user_id text not null references app_users(user_id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null
);

create table if not exists tenant_memberships (
  user_id text not null references app_users(user_id) on delete cascade,
  tenant_id text not null references tenants(tenant_id) on delete cascade,
  role text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  primary key (user_id, tenant_id)
);

create table if not exists tenant_domains (
  id bigserial primary key,
  tenant_id text not null references tenants(tenant_id) on delete cascade,
  host text not null,
  primary_domain boolean not null default false,
  market_id text
);

create table if not exists tenant_markets (
  id text not null,
  tenant_id text not null references tenants(tenant_id) on delete cascade,
  label text not null,
  country_code text not null,
  currency_code text not null,
  locale text not null,
  storefront_domain text not null,
  primary key (tenant_id, id)
);

create table if not exists meta_connections (
  tenant_id text primary key references tenants(tenant_id) on delete cascade,
  pixel_id text not null,
  access_token text not null,
  test_event_code text,
  enabled boolean not null default true,
  last_validated_at timestamptz
);

create table if not exists ga4_connections (
  tenant_id text primary key references tenants(tenant_id) on delete cascade,
  measurement_id text not null,
  api_secret text not null,
  debug_mode boolean not null default false,
  enabled boolean not null default false,
  last_validated_at timestamptz
);

create table if not exists google_ads_connections (
  tenant_id text primary key references tenants(tenant_id) on delete cascade,
  customer_id text not null,
  conversion_action_id text not null,
  login_customer_id text,
  developer_token text,
  refresh_token text,
  client_id text,
  client_secret text,
  transport text not null default 'preview',
  enabled boolean not null default false,
  last_validated_at timestamptz
);

create table if not exists tiktok_connections (
  tenant_id text primary key references tenants(tenant_id) on delete cascade,
  pixel_code text not null,
  access_token text,
  test_event_code text,
  endpoint text,
  enabled boolean not null default false,
  last_validated_at timestamptz
);

create table if not exists tenant_tracking_configs (
  tenant_id text primary key references tenants(tenant_id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tenant_enabled_scenarios (
  tenant_id text not null references tenants(tenant_id) on delete cascade,
  scenario_id text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (tenant_id, scenario_id)
);

create table if not exists tenant_custom_event_mappings (
  id bigserial primary key,
  tenant_id text not null references tenants(tenant_id) on delete cascade,
  source_name text not null,
  scenario_id text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists tenant_custom_event_mappings_unique_idx
  on tenant_custom_event_mappings (tenant_id, source_name);

create table if not exists tenant_destination_overrides (
  id bigserial primary key,
  tenant_id text not null references tenants(tenant_id) on delete cascade,
  scope_type text not null,
  scope_id text not null,
  label text not null,
  domain_host text,
  market_id text,
  destinations jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, scope_type, scope_id)
);

create table if not exists shop_installations (
  shop_domain text primary key,
  tenant_id text not null references tenants(tenant_id) on delete cascade,
  access_token text,
  scopes text[] not null,
  status text not null,
  installed_at timestamptz not null,
  uninstalled_at timestamptz
);

create table if not exists support_requests (
  request_id text primary key,
  name text not null,
  email text not null,
  shop_domain text,
  category text not null,
  subject text not null,
  description text not null,
  status text not null,
  created_at timestamptz not null
);

create index if not exists support_requests_created_at_idx
  on support_requests (created_at desc);

create table if not exists identity_profiles (
  identity_key text primary key,
  tenant_id text not null references tenants(tenant_id) on delete cascade,
  anonymous_id text,
  customer_id text,
  email text,
  phone text,
  external_id text,
  first_seen_at timestamptz not null,
  last_seen_at timestamptz not null
);

create table if not exists normalized_events (
  event_id text primary key,
  tenant_id text not null references tenants(tenant_id) on delete cascade,
  shop_domain text not null,
  event_name text not null,
  event_source text not null,
  occurred_at timestamptz not null,
  dedupe_key text not null unique,
  identity_key text not null references identity_profiles(identity_key),
  market_country_code text not null,
  market_currency_code text not null,
  market_id text,
  market_domain text,
  payload jsonb not null,
  delivered_to_meta boolean not null default false,
  delivery_statuses jsonb not null default '{}'::jsonb,
  scenario_id text,
  scenario_enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists normalized_events_tenant_occurred_at_idx
  on normalized_events (tenant_id, occurred_at desc);

create table if not exists webhook_receipts (
  id bigserial primary key,
  topic text not null,
  shop_domain text not null,
  verified boolean not null,
  received_at timestamptz not null,
  payload jsonb
);
