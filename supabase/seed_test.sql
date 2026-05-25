-- ============================================================
-- DENTRO — Seed de prueba
-- Usuarios:
--   oferente@dentro.ar  / dentro123  → oferente  (Los Castores)
--   demandante@dentro.ar / dentro123 → demandante (Los Castores)
-- ============================================================

do $$
declare
  v_oferente_id  uuid;
  v_demandante_id uuid;
  v_zona_id      uuid;
  v_cat_id       uuid;
  v_producto_id  uuid;
begin

  -- Obtener IDs de datos semilla ya cargados
  select id into v_zona_id from public.zonas      where slug   = 'los-castores';
  select id into v_cat_id  from public.categorias where nombre = 'Leña y combustible';

  -- ── OFERENTE ─────────────────────────────────────────────
  select id into v_oferente_id from auth.users where email = 'oferente@dentro.ar';

  if v_oferente_id is null then
    v_oferente_id := gen_random_uuid();
    insert into auth.users (
      id, instance_id, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, aud, role
    ) values (
      v_oferente_id,
      '00000000-0000-0000-0000-000000000000',
      'oferente@dentro.ar',
      crypt('dentro123', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}',
      '{"nombre":"Oferente Test"}',
      'authenticated', 'authenticated'
    );
    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), v_oferente_id, v_oferente_id::text,
      jsonb_build_object('sub', v_oferente_id::text, 'email', 'oferente@dentro.ar'),
      'email', now(), now(), now()
    );
  end if;

  insert into public.profiles (user_id, nombre, rol, zona_id)
  values (v_oferente_id, 'Oferente Test', 'oferente', v_zona_id)
  on conflict (user_id) do nothing;

  -- ── DEMANDANTE ────────────────────────────────────────────
  select id into v_demandante_id from auth.users where email = 'demandante@dentro.ar';

  if v_demandante_id is null then
    v_demandante_id := gen_random_uuid();
    insert into auth.users (
      id, instance_id, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, aud, role
    ) values (
      v_demandante_id,
      '00000000-0000-0000-0000-000000000000',
      'demandante@dentro.ar',
      crypt('dentro123', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}',
      '{"nombre":"Demandante Test"}',
      'authenticated', 'authenticated'
    );
    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), v_demandante_id, v_demandante_id::text,
      jsonb_build_object('sub', v_demandante_id::text, 'email', 'demandante@dentro.ar'),
      'email', now(), now(), now()
    );
  end if;

  insert into public.profiles (user_id, nombre, rol, zona_id)
  values (v_demandante_id, 'Demandante Test', 'demandante', v_zona_id)
  on conflict (user_id) do nothing;

  -- ── PRODUCTO + DISPONIBILIDAD ─────────────────────────────
  select id into v_producto_id from public.productos where nombre = 'Leña seca de quebracho';

  if v_producto_id is null then
    v_producto_id := gen_random_uuid();
    insert into public.productos (id, nombre, descripcion, categoria_id)
    values (
      v_producto_id,
      'Leña seca de quebracho',
      'Bolsones de 20kg. Lista para usar. Entrego en el barrio.',
      v_cat_id
    );
  end if;

  insert into public.disponibilidad (producto_id, zona_id, oferente_id, activo, contacto_whatsapp)
  select v_producto_id, v_zona_id, v_oferente_id, true, '5491112345678'
  where not exists (
    select 1 from public.disponibilidad
    where producto_id = v_producto_id and zona_id = v_zona_id and oferente_id = v_oferente_id
  );

  raise notice 'Seed OK';
  raise notice 'oferente@dentro.ar   / dentro123  → /oferente/dashboard';
  raise notice 'demandante@dentro.ar / dentro123  → /zona/los-castores';
end $$;
