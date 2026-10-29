-- Cierra la API publica de Supabase (Data API REST y GraphQL con la llave
-- anon) sobre las tablas de la app. Resuelve las alertas criticas
-- "RLS Disabled in Public" del Security Advisor.
--
-- La app no usa esa API: todo pasa por Prisma con el rol postgres, que es
-- dueño de las tablas y tiene BYPASSRLS, asi que nada de esto le afecta.
-- Antes de esta migracion los roles anon y authenticated podian leer,
-- modificar, borrar y vaciar cualquier tabla.
--
-- Es idempotente y tambien corre en bases que no son de Supabase (CI, local,
-- shadow database de Prisma): si un rol o permiso no existe, ese paso se omite.

-- 1. RLS en todas las tablas de public. Sin politicas, nadie entra por la API.
DO $$
DECLARE
  t record;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
  END LOOP;
END $$;

-- 2. Quitar los permisos de los roles de la API, tambien para las tablas que
--    se creen despues (Supabase se los concede por defecto).
DO $$
DECLARE
  r text;
BEGIN
  FOREACH r IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA public FROM %I', r);
      EXECUTE format('REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM %I', r);
      EXECUTE format('REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM %I', r);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM %I', r);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM %I', r);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM %I', r);
    END IF;
  END LOOP;
END $$;

-- 3. Tablas nuevas (por ejemplo, de futuras migraciones de Prisma): activar
--    RLS en cuanto se crean, para que nadie tenga que acordarse.
CREATE OR REPLACE FUNCTION public.rls_auto_enable()
RETURNS event_trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT object_identity
    FROM pg_event_trigger_ddl_commands()
    WHERE object_type IN ('table', 'partitioned table')
      AND schema_name = 'public'
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', cmd.object_identity);
    EXCEPTION WHEN OTHERS THEN
      -- Nunca bloquear una migracion por esto: solo avisar.
      RAISE WARNING 'rls_auto_enable: no se pudo activar RLS en %: %', cmd.object_identity, SQLERRM;
    END;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_event_trigger WHERE evtname = 'rls_auto_enable') THEN
    CREATE EVENT TRIGGER rls_auto_enable ON ddl_command_end
      WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      EXECUTE FUNCTION public.rls_auto_enable();
  END IF;
EXCEPTION WHEN insufficient_privilege THEN
  RAISE NOTICE 'Sin permiso para crear el event trigger rls_auto_enable: activar RLS a mano en las tablas nuevas.';
END $$;
