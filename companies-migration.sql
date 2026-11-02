-- Migration: client -> companies -> subscriptions
-- Run this in the Supabase SQL Editor before using the Companies page.

-- New companies table (a client/org can own many companies)
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

-- Link subscriptions to a company (nullable = "Unassigned")
alter table subscriptions
  add column if not exists company_id uuid references companies(id) on delete set null;

create index if not exists companies_org_id_idx on companies (org_id);
create index if not exists subscriptions_company_id_idx on subscriptions (company_id);

-- RLS: only the org owner can touch their companies
alter table companies enable row level security;

drop policy if exists "owners select companies" on companies;
create policy "owners select companies" on companies for select
  using (exists (select 1 from organizations o where o.id = org_id and o.owner_id = auth.uid()));

drop policy if exists "owners insert companies" on companies;
create policy "owners insert companies" on companies for insert
  with check (exists (select 1 from organizations o where o.id = org_id and o.owner_id = auth.uid()));

drop policy if exists "owners update companies" on companies;
create policy "owners update companies" on companies for update
  using (exists (select 1 from organizations o where o.id = org_id and o.owner_id = auth.uid()));

drop policy if exists "owners delete companies" on companies;
create policy "owners delete companies" on companies for delete
  using (exists (select 1 from organizations o where o.id = org_id and o.owner_id = auth.uid()));
