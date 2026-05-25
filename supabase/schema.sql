-- ============================================================
-- DENTRO — Schema completo (idempotente — se puede correr varias veces)
-- Pegar en: Supabase → SQL Editor → New query → Run
-- ============================================================


-- ============================================================
-- 1. ZONAS
-- ============================================================
create table if not exists public.zonas (
  id   uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug   text not null unique
);

-- ============================================================
-- 2. CATEGORIAS
-- ============================================================
create table if not exists public.categorias (
  id     uuid primary key default gen_random_uuid(),
  nombre text not null,
  icono  text  -- emoji o nombre de ícono
);

-- ============================================================
-- 3. PRODUCTOS
-- ============================================================
create table if not exists public.productos (
  id           uuid primary key default gen_random_uuid(),
  nombre       text not null,
  descripcion  text,
  foto_url     text,
  categoria_id uuid references public.categorias(id) on delete set null
);

-- ============================================================
-- 4. PROFILES (extiende auth.users)
-- ============================================================
create table if not exists public.profiles (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null unique references auth.users(id) on delete cascade,
  nombre   text,
  rol      text not null check (rol in ('oferente', 'demandante')),
  zona_id  uuid references public.zonas(id) on delete set null,
  created_at timestamptz default now()
);

-- ============================================================
-- 5. DISPONIBILIDAD
-- ============================================================
create table if not exists public.disponibilidad (
  id                 uuid primary key default gen_random_uuid(),
  producto_id        uuid not null references public.productos(id) on delete cascade,
  zona_id            uuid not null references public.zonas(id) on delete cascade,
  oferente_id        uuid not null references auth.users(id) on delete cascade,
  activo             boolean not null default true,
  contacto_whatsapp  text,
  created_at         timestamptz default now()
);

-- ============================================================
-- 6. CONVERSACIONES
-- ============================================================
create table if not exists public.conversaciones (
  id                uuid primary key default gen_random_uuid(),
  demandante_id     uuid not null references auth.users(id) on delete cascade,
  oferente_id       uuid not null references auth.users(id) on delete cascade,
  disponibilidad_id uuid not null references public.disponibilidad(id) on delete cascade,
  created_at        timestamptz default now()
);

-- ============================================================
-- 7. MENSAJES
-- ============================================================
create table if not exists public.mensajes (
  id               uuid primary key default gen_random_uuid(),
  conversacion_id  uuid not null references public.conversaciones(id) on delete cascade,
  autor_id         uuid not null references auth.users(id) on delete cascade,
  contenido        text not null,
  created_at       timestamptz default now()
);

-- Índice para acelerar la carga del chat
create index if not exists mensajes_conversacion_idx on public.mensajes(conversacion_id, created_at asc);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.zonas        enable row level security;
alter table public.categorias   enable row level security;
alter table public.productos    enable row level security;
alter table public.disponibilidad enable row level security;
alter table public.profiles     enable row level security;
alter table public.conversaciones enable row level security;
alter table public.mensajes     enable row level security;

-- Eliminar políticas previas para recrearlas sin error
drop policy if exists "zonas_lectura_publica"            on public.zonas;
drop policy if exists "categorias_lectura_publica"       on public.categorias;
drop policy if exists "productos_lectura_publica"        on public.productos;
drop policy if exists "disponibilidad_lectura_publica"   on public.disponibilidad;
drop policy if exists "disponibilidad_update_oferente"   on public.disponibilidad;
drop policy if exists "profiles_select_propio"           on public.profiles;
drop policy if exists "profiles_insert_propio"           on public.profiles;
drop policy if exists "profiles_update_propio"           on public.profiles;
drop policy if exists "conversaciones_participantes"     on public.conversaciones;
drop policy if exists "conversaciones_insert_demandante" on public.conversaciones;
drop policy if exists "mensajes_select_participantes"    on public.mensajes;
drop policy if exists "mensajes_insert_participantes"    on public.mensajes;

-- Zonas: lectura pública
create policy "zonas_lectura_publica"
  on public.zonas for select using (true);

-- Categorías: lectura pública
create policy "categorias_lectura_publica"
  on public.categorias for select using (true);

-- Productos: lectura pública
create policy "productos_lectura_publica"
  on public.productos for select using (true);

-- Disponibilidad: lectura pública (solo muestra activo=true desde la app)
create policy "disponibilidad_lectura_publica"
  on public.disponibilidad for select using (true);

-- Disponibilidad: el oferente puede modificar solo sus registros
create policy "disponibilidad_update_oferente"
  on public.disponibilidad for update
  using (auth.uid() = oferente_id);

-- Profiles: cada usuario ve y edita solo el suyo
create policy "profiles_select_propio"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "profiles_insert_propio"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "profiles_update_propio"
  on public.profiles for update
  using (auth.uid() = user_id);

-- Conversaciones: solo los dos participantes pueden verla
create policy "conversaciones_participantes"
  on public.conversaciones for select
  using (
    auth.uid() = demandante_id or
    auth.uid() = oferente_id
  );

create policy "conversaciones_insert_demandante"
  on public.conversaciones for insert
  with check (auth.uid() = demandante_id);

-- Mensajes: solo los participantes de la conversación los ven
create policy "mensajes_select_participantes"
  on public.mensajes for select
  using (
    exists (
      select 1 from public.conversaciones c
      where c.id = conversacion_id
        and (c.demandante_id = auth.uid() or c.oferente_id = auth.uid())
    )
  );

create policy "mensajes_insert_participantes"
  on public.mensajes for insert
  with check (
    auth.uid() = autor_id and
    exists (
      select 1 from public.conversaciones c
      where c.id = conversacion_id
        and (c.demandante_id = auth.uid() or c.oferente_id = auth.uid())
    )
  );

-- Habilitar Realtime para mensajes (solo si no está ya registrada)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'mensajes'
  ) then
    alter publication supabase_realtime add table public.mensajes;
  end if;
end $$;


-- ============================================================
-- GRANTS — Permisos de tabla por rol
-- (RLS policies controlan filas; GRANT controla acceso a la tabla)
-- ============================================================

-- Rol anónimo: lectura de tablas públicas
grant select on public.zonas          to anon;
grant select on public.categorias     to anon;
grant select on public.productos      to anon;
grant select on public.disponibilidad to anon;

-- Rol autenticado: acceso completo según RLS
grant select, insert, update on public.zonas          to authenticated;
grant select                  on public.categorias     to authenticated;
grant select                  on public.productos      to authenticated;
grant select, insert, update  on public.disponibilidad to authenticated;
grant select, insert, update  on public.profiles       to authenticated;
grant select, insert          on public.conversaciones to authenticated;
grant select, insert          on public.mensajes       to authenticated;


-- ============================================================
-- DATOS SEMILLA — Piloto Estancias Pilar
-- ============================================================

-- Zonas (solo inserta si no existen)
insert into public.zonas (nombre, slug) values
  ('Estancias del Pilar', 'estancias-pilar'),
  ('Los Castores',        'los-castores'),
  ('Santa María',         'santa-maria')
on conflict (slug) do nothing;

-- Categorías (solo inserta si no existen)
insert into public.categorias (nombre, icono) values
  ('Leña y combustible', '🪵'),
  ('Hielo y bebidas',    '🧊'),
  ('Carbón y parrilla',  '🔥'),
  ('Viandas y comida',   '🥗'),
  ('Congelados',         '❄️')
on conflict do nothing;
