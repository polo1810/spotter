-- ===========================================
-- SPOTTER · Schéma Supabase
-- ===========================================
-- À exécuter dans le SQL Editor de ton dashboard Supabase.
-- Tu peux le lancer plusieurs fois, c'est idempotent.
--
-- Ce script crée :
--   - Table `clients`        : profil + réponses questionnaire (1 ligne par cabinet)
--   - Table `repetitions`    : actions répétitives détectées (rentrées à la main)
--   - Politiques RLS         : chaque client ne voit que SES données ; l'admin voit tout
--
-- Avant de lancer ce script, crée ton compte admin dans :
--   Authentication → Users → Add user → Create new user
-- avec l'email que tu mettras dans ADMIN_EMAIL côté front (js/supabase-config.js).
-- Les politiques admin ci-dessous se basent sur cet email.

-- ===========================================
-- TABLES
-- ===========================================

create table if not exists public.clients (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid unique references auth.users(id) on delete cascade,
  email                 text not null unique,
  vertical              text not null,                      -- 'comptable', 'recrutement'...
  questionnaire_answers jsonb not null default '{}'::jsonb,  -- toutes les réponses brutes
  cabinet_name          text,                                -- éditable par l'admin
  cabinet_info          text,                                -- éditable par l'admin (ex: "5 collabs · Caen")
  period_label          text,                                -- éditable par l'admin (ex: "Période analysée : 7-14 nov.")
  ip                    text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists clients_user_id_idx on public.clients (user_id);
create index if not exists clients_email_idx   on public.clients (email);

create table if not exists public.repetitions (
  id                   uuid primary key default gen_random_uuid(),
  client_id            uuid not null references public.clients(id) on delete cascade,
  libelle              text not null,
  description          text,
  frequence            integer not null default 0,
  frequence_unit       text not null default 'semaine',     -- 'jour' | 'semaine' | 'mois'
  temps_perdu_minutes  integer not null default 0,          -- temps total perdu sur la période, en minutes
  statut               text not null default 'detected',    -- 'detected' | 'automatable' | 'automated'
  ordre                integer not null default 0,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists repetitions_client_id_idx on public.repetitions (client_id);

-- updated_at auto sur changement
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists clients_set_updated_at     on public.clients;
drop trigger if exists repetitions_set_updated_at on public.repetitions;

create trigger clients_set_updated_at
  before update on public.clients
  for each row execute function public.tg_set_updated_at();

create trigger repetitions_set_updated_at
  before update on public.repetitions
  for each row execute function public.tg_set_updated_at();

-- ===========================================
-- ROW LEVEL SECURITY
-- ===========================================

alter table public.clients     enable row level security;
alter table public.repetitions enable row level security;

-- Helper : email du user courant depuis le JWT (null si non loggué)
create or replace function public.current_email()
returns text language sql stable as $$
  select coalesce(auth.jwt() ->> 'email', '');
$$;

-- Helper : email de l'admin (à synchroniser avec ADMIN_EMAIL côté front)
-- ⚠️ Modifie cette valeur si tu changes l'email admin dans supabase-config.js
create or replace function public.admin_email()
returns text language sql immutable as $$
  select 'paulgirardecommerce50@gmail.com';   -- doit matcher ADMIN_EMAIL côté front
$$;

create or replace function public.is_admin()
returns boolean language sql stable as $$
  select public.current_email() = public.admin_email();
$$;

-- ----- POLICIES : clients -----

-- Insert anonyme (le questionnaire crée le client avant qu'il ait un compte)
drop policy if exists "clients_anon_insert"  on public.clients;
create policy "clients_anon_insert"
  on public.clients for insert
  with check (true);

-- Le user lit son propre profil (par user_id ou par email tant que pas encore lié)
drop policy if exists "clients_self_select"  on public.clients;
create policy "clients_self_select"
  on public.clients for select
  using (
    auth.uid() = user_id
    or (user_id is null and email = public.current_email())
  );

-- Le user met à jour son propre profil (utile au moment du signUp pour lier user_id)
drop policy if exists "clients_self_update"  on public.clients;
create policy "clients_self_update"
  on public.clients for update
  using (
    auth.uid() = user_id
    or (user_id is null and email = public.current_email())
  )
  with check (
    auth.uid() = user_id
    or (user_id is null and email = public.current_email())
  );

-- Admin : accès complet
drop policy if exists "clients_admin_all"    on public.clients;
create policy "clients_admin_all"
  on public.clients for all
  using (public.is_admin())
  with check (public.is_admin());

-- ----- POLICIES : repetitions -----

-- Le user lit ses propres répétitions
drop policy if exists "repetitions_self_select" on public.repetitions;
create policy "repetitions_self_select"
  on public.repetitions for select
  using (
    exists (
      select 1 from public.clients c
      where c.id = repetitions.client_id
        and c.user_id = auth.uid()
    )
  );

-- Admin : accès complet
drop policy if exists "repetitions_admin_all" on public.repetitions;
create policy "repetitions_admin_all"
  on public.repetitions for all
  using (public.is_admin())
  with check (public.is_admin());

-- ===========================================
-- FIN
-- ===========================================
-- N'oublie pas après exécution :
-- 1) Mettre ton vrai email admin dans la fonction public.admin_email() ci-dessus
-- 2) Mettre les mêmes credentials dans js/supabase-config.js
-- 3) Créer le compte admin dans Authentication → Users (email + password identiques)
