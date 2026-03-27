create table tenants (
  tenant_id text primary key,
  display_name text not null,
  shop_domain text not null unique,
  plan_id text not null,
  status text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table tenant_domains (
  id bigserial primary key,
  tenant_id text not null references tenants(tenant_id) on delete cascade,
  host text not null,
  primary_domain boolean not null default false,
  market_id text
);

create table tenant_markets (
  id text not null,
  tenant_id text not null references tenants(tenant_id) on delete cascade,
  label text not null,
  country_code text not null,
  currency_code text not null,
  locale text not null,
  storefront_domain text not null,
  primary key (tenant_id, id)
);

create table meta_connections (
  tenant_id text primary key references tenants(tenant_id) on delete cascade,
  pixel_id text not null,
  access_token text not null,
  test_event_code text,
  enabled boolean not null default true,
  last_validated_at timestamptz
);

create table shop_installations (
  shop_domain text primary key,
  tenant_id text not null references tenants(tenant_id) on delete cascade,
  access_token text,
  scopes text[] not null,
  status text not null,
  installed_at timestamptz not null,
  uninstalled_at timestamptz
);

create table identity_profiles (
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

create table normalized_events (
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
  created_at timestamptz not null default now()
);

create index normalized_events_tenant_occurred_at_idx
  on normalized_events (tenant_id, occurred_at desc);

create table webhook_receipts (
  id bigserial primary key,
  topic text not null,
  shop_domain text not null,
  verified boolean not null,
  received_at timestamptz not null,
  payload jsonb
);
