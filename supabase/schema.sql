-- SC2 Command Center - estado inicial para GitHub Pages + Supabase.
-- Ejecuta este archivo en Supabase SQL Editor antes de usar el panel Admin en linea.
--
-- Nota de seguridad:
-- estas politicas permiten leer y actualizar los documentos publicos de la app desde la clave publica.
-- Es suficiente como base temporal para un sitio estatico con password visual en frontend.
-- Cuando agreguemos usuarios reales, hay que reemplazar estas politicas por Supabase Auth.
--
-- Documentos usados:
-- - corp-command: miembros, alters, EX-CORP y lista negra.
-- - guides-library: biblioteca de guias.
-- - community-events: miembros de eventos, eventos y participaciones.
-- - monthly-kills: Kill del Mes, ranking, historial y perfiles.

create table if not exists public.app_state (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

drop policy if exists "app_state_corp_command_read" on public.app_state;
drop policy if exists "app_state_corp_command_insert" on public.app_state;
drop policy if exists "app_state_corp_command_update" on public.app_state;

create policy "app_state_corp_command_read"
  on public.app_state
  for select
  to anon
  using (id in ('corp-command', 'guides-library', 'community-events', 'monthly-kills'));

create policy "app_state_corp_command_insert"
  on public.app_state
  for insert
  to anon
  with check (id in ('corp-command', 'guides-library', 'community-events', 'monthly-kills'));

create policy "app_state_corp_command_update"
  on public.app_state
  for update
  to anon
  using (id in ('corp-command', 'guides-library', 'community-events', 'monthly-kills'))
  with check (id in ('corp-command', 'guides-library', 'community-events', 'monthly-kills'));

grant usage on schema public to anon;
grant select, insert, update on public.app_state to anon;

insert into public.app_state (id, data)
values (
  'corp-command',
  jsonb_build_object(
    'app', 'EVE Echoes Corp Command',
    'version', 1,
    'exportedAt', now(),
    'members', '[]'::jsonb
  )
)
on conflict (id) do nothing;

insert into public.app_state (id, data)
values (
  'guides-library',
  jsonb_build_object(
    'app', 'SC2 Guides Library',
    'version', 1,
    'exportedAt', now(),
    'guides', '[]'::jsonb
  )
)
on conflict (id) do nothing;

insert into public.app_state (id, data)
values (
  'community-events',
  jsonb_build_object(
    'app', 'SC2 Community Event Manager',
    'version', 2,
    'exportedAt', now(),
    'members', '[]'::jsonb,
    'events', '[]'::jsonb,
    'participations', '[]'::jsonb
  )
)
on conflict (id) do nothing;

insert into public.app_state (id, data)
values (
  'monthly-kills',
  jsonb_build_object(
    'app', 'SC2 Kill del Mes',
    'version', 1,
    'exportedAt', now(),
    'kills', '[]'::jsonb
  )
)
on conflict (id) do nothing;
