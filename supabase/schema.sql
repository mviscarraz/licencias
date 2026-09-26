-- ============================================================
-- SISTEMA DE LICENCIAS Y PERMISOS ESCOLARES
-- Script único: pega esto completo en el SQL Editor de Supabase
-- y presiona "Run". Se puede ejecutar una sola vez.
-- ============================================================

-- ---------- EXTENSIONES ----------
create extension if not exists "pgcrypto";

-- ============================================================
-- TABLAS
-- ============================================================

create table if not exists perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  correo text not null,
  nombre text,
  rol text not null default 'alumno' check (rol in ('alumno','secretario','administrador')),
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

create table if not exists alumnos (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid unique references perfiles(id) on delete cascade,
  nombre_completo text not null,
  ci text,
  codigo_estudiante text,
  telefono text,
  correo text,
  creado_en timestamptz not null default now()
);

create table if not exists gestiones_escolares (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  activa boolean not null default true
);

create table if not exists cursos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique
);

create table if not exists paralelos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique
);

create table if not exists matriculas (
  id uuid primary key default gen_random_uuid(),
  alumno_id uuid not null references alumnos(id) on delete cascade,
  gestion_id uuid not null references gestiones_escolares(id),
  curso_id uuid not null references cursos(id),
  paralelo_id uuid not null references paralelos(id),
  creado_en timestamptz not null default now(),
  unique (alumno_id, gestion_id)
);

create table if not exists tipos_licencia (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  activo boolean not null default true
);

create table if not exists solicitudes (
  id uuid primary key default gen_random_uuid(),
  alumno_id uuid not null references alumnos(id) on delete cascade,
  matricula_id uuid not null references matriculas(id),
  tipo_licencia_id uuid not null references tipos_licencia(id),
  fecha_inicio date not null,
  fecha_fin date not null,
  cantidad numeric,
  observaciones text,
  estado text not null default 'pendiente' check (estado in ('pendiente','aprobada','rechazada')),
  motivo_rechazo text,
  creado_en timestamptz not null default now()
);

create table if not exists documentos_solicitud (
  id uuid primary key default gen_random_uuid(),
  solicitud_id uuid not null references solicitudes(id) on delete cascade,
  ruta_storage text not null,
  nombre_archivo text,
  tipo_archivo text,
  subido_en timestamptz not null default now()
);

create table if not exists resoluciones (
  id uuid primary key default gen_random_uuid(),
  solicitud_id uuid not null references solicitudes(id) on delete cascade,
  resuelto_por uuid references perfiles(id),
  decision text not null check (decision in ('aprobada','rechazada','revertida')),
  motivo_rechazo text,
  fecha timestamptz not null default now()
);

-- ============================================================
-- FUNCIÓN AUXILIAR: rol del usuario autenticado (evita recursión en RLS)
-- ============================================================
create or replace function mi_rol()
returns text
language sql
security definer
set search_path = public
as $$
  select rol from perfiles where id = auth.uid();
$$;

-- ============================================================
-- TRIGGER: crear perfil automáticamente al crear un usuario en Authentication
-- ============================================================
create or replace function manejar_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into perfiles (id, correo, nombre, rol)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'nombre', new.email), 'alumno')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function manejar_nuevo_usuario();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table perfiles enable row level security;
alter table alumnos enable row level security;
alter table gestiones_escolares enable row level security;
alter table cursos enable row level security;
alter table paralelos enable row level security;
alter table matriculas enable row level security;
alter table tipos_licencia enable row level security;
alter table solicitudes enable row level security;
alter table documentos_solicitud enable row level security;
alter table resoluciones enable row level security;

-- perfiles
create policy "perfiles: ver propio o si es staff" on perfiles for select
  using (id = auth.uid() or mi_rol() in ('secretario','administrador'));
create policy "perfiles: administrador administra" on perfiles for all
  using (mi_rol() = 'administrador');

-- alumnos
create policy "alumnos: ver propio o si es staff" on alumnos for select
  using (perfil_id = auth.uid() or mi_rol() in ('secretario','administrador'));
create policy "alumnos: administrador escribe" on alumnos for insert
  with check (mi_rol() = 'administrador');
create policy "alumnos: administrador edita" on alumnos for update
  using (mi_rol() = 'administrador');
create policy "alumnos: administrador elimina" on alumnos for delete
  using (mi_rol() = 'administrador');

-- catálogos de lectura general (autenticados) y escritura solo administrador
create policy "gestiones: lectura autenticados" on gestiones_escolares for select using (auth.uid() is not null);
create policy "gestiones: admin escribe" on gestiones_escolares for all using (mi_rol() = 'administrador');

create policy "cursos: lectura autenticados" on cursos for select using (auth.uid() is not null);
create policy "cursos: admin escribe" on cursos for all using (mi_rol() = 'administrador');

create policy "paralelos: lectura autenticados" on paralelos for select using (auth.uid() is not null);
create policy "paralelos: admin escribe" on paralelos for all using (mi_rol() = 'administrador');

create policy "tipos_licencia: lectura autenticados" on tipos_licencia for select using (auth.uid() is not null);
create policy "tipos_licencia: admin escribe" on tipos_licencia for all using (mi_rol() = 'administrador');

-- matriculas
create policy "matriculas: ver propia o si es staff" on matriculas for select
  using (
    mi_rol() in ('secretario','administrador')
    or alumno_id in (select id from alumnos where perfil_id = auth.uid())
  );
create policy "matriculas: admin escribe" on matriculas for all using (mi_rol() = 'administrador');

-- solicitudes
create policy "solicitudes: alumno ve las propias, staff ve todas" on solicitudes for select
  using (
    mi_rol() in ('secretario','administrador')
    or alumno_id in (select id from alumnos where perfil_id = auth.uid())
  );
create policy "solicitudes: alumno crea las propias" on solicitudes for insert
  with check (alumno_id in (select id from alumnos where perfil_id = auth.uid()));
create policy "solicitudes: staff actualiza (aprobar/rechazar/revertir)" on solicitudes for update
  using (mi_rol() in ('secretario','administrador'));

-- documentos_solicitud
create policy "documentos: ver propios o si es staff" on documentos_solicitud for select
  using (
    mi_rol() in ('secretario','administrador')
    or solicitud_id in (
      select s.id from solicitudes s
      join alumnos a on a.id = s.alumno_id
      where a.perfil_id = auth.uid()
    )
  );
create policy "documentos: alumno sube a sus propias solicitudes" on documentos_solicitud for insert
  with check (
    solicitud_id in (
      select s.id from solicitudes s
      join alumnos a on a.id = s.alumno_id
      where a.perfil_id = auth.uid()
    )
  );

-- resoluciones
create policy "resoluciones: staff ve y crea todas" on resoluciones for all
  using (mi_rol() in ('secretario','administrador'));
create policy "resoluciones: alumno solo lee las de sus solicitudes" on resoluciones for select
  using (
    solicitud_id in (
      select s.id from solicitudes s
      join alumnos a on a.id = s.alumno_id
      where a.perfil_id = auth.uid()
    )
  );

-- ============================================================
-- STORAGE: bucket privado para documentos de respaldo
-- ============================================================
insert into storage.buckets (id, name, public)
values ('documentos-solicitudes', 'documentos-solicitudes', false)
on conflict (id) do nothing;

create policy "storage: staff ve todos los documentos" on storage.objects for select
  using (bucket_id = 'documentos-solicitudes' and mi_rol() in ('secretario','administrador'));

create policy "storage: alumno ve documentos de sus propias solicitudes" on storage.objects for select
  using (
    bucket_id = 'documentos-solicitudes'
    and (storage.foldername(name))[1] in (
      select s.id::text from solicitudes s
      join alumnos a on a.id = s.alumno_id
      where a.perfil_id = auth.uid()
    )
  );

create policy "storage: alumno sube a sus propias solicitudes" on storage.objects for insert
  with check (
    bucket_id = 'documentos-solicitudes'
    and (storage.foldername(name))[1] in (
      select s.id::text from solicitudes s
      join alumnos a on a.id = s.alumno_id
      where a.perfil_id = auth.uid()
    )
  );

-- ============================================================
-- DATOS INICIALES DE EJEMPLO (puedes editarlos o borrarlos luego)
-- ============================================================
insert into tipos_licencia (nombre) values
  ('Enfermedad'), ('Consulta médica'), ('Emergencia familiar'), ('Trámite personal'), ('Accidente'), ('Otros')
on conflict (nombre) do nothing;

-- FIN DEL SCRIPT PRINCIPAL. Ahora ve al Paso 2 (paso2-hacer-administrador.sql)
