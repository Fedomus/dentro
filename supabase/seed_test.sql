-- ============================================================
-- DENTRO — Seed de prueba
-- Crea: 1 usuario oferente + perfil + 1 producto + disponibilidad
-- Zona: Los Castores
-- Login: oferente@dentro.ar / dentro123
-- ============================================================

do $$
declare
  v_user_id      uuid;
  v_zona_id      uuid;
  v_cat_id       uuid;
  v_producto_id  uuid;
begin

  -- Obtener IDs de datos semilla ya cargados
  select id into v_zona_id from public.zonas      where slug   = 'los-castores';
  select id into v_cat_id  from public.categorias where nombre = 'Leña y combustible';

  -- Si el usuario ya existe, reusar su ID
  select id into v_user_id from auth.users where email = 'oferente@dentro.ar';

  if v_user_id is null then
    v_user_id := gen_random_uuid();

    -- Crear usuario en auth.users
    insert into auth.users (
      id, instance_id, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, aud, role
    ) values (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'oferente@dentro.ar',
      crypt('dentro123', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}',
      '{"nombre":"Oferente Test"}',
      'authenticated',
      'authenticated'
    );

    -- Crear identidad (necesaria para que el login funcione)
    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(),
      v_user_id,
      v_user_id::text,
      jsonb_build_object('sub', v_user_id::text, 'email', 'oferente@dentro.ar'),
      'email',
      now(), now(), now()
    );
  end if;

  -- Crear perfil oferente (si no existe)
  insert into public.profiles (user_id, nombre, rol, zona_id)
  values (v_user_id, 'Oferente Test', 'oferente', v_zona_id)
  on conflict (user_id) do nothing;

  -- Crear producto (si no existe)
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

  -- Crear disponibilidad (si no existe)
  insert into public.disponibilidad (producto_id, zona_id, oferente_id, activo, contacto_whatsapp)
  select v_producto_id, v_zona_id, v_user_id, true, '5491112345678'
  where not exists (
    select 1 from public.disponibilidad
    where producto_id = v_producto_id and zona_id = v_zona_id and oferente_id = v_user_id
  );

  raise notice 'Seed OK — usuario: oferente@dentro.ar / dentro123';
end $$;
