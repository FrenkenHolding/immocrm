-- Objekte
create table if not exists objekte (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  adresse text,
  plz text,
  ort text,
  typ text default 'MFH',
  einheiten int default 1,
  baujahr text,
  created_at timestamp default now()
);

-- Mieter
create table if not exists mieter (
  id uuid default gen_random_uuid() primary key,
  objekt_id uuid references objekte(id) on delete cascade,
  vorname text,
  nachname text,
  email text,
  telefon text,
  einheit text,
  kaltmiete numeric default 0,
  nebenkosten numeric default 0,
  kaution numeric default 0,
  vertrag_von date,
  vertrag_bis date,
  status text default 'aktiv',
  created_at timestamp default now()
);

-- Dokumente
create table if not exists dokumente (
  id uuid default gen_random_uuid() primary key,
  mieter_id uuid references mieter(id) on delete cascade,
  objekt_id uuid,
  name text,
  typ text,
  groesse bigint,
  url text,
  pfad text,
  created_at timestamp default now()
);

-- Kommunikation / Notizen
create table if not exists kommunikation (
  id uuid default gen_random_uuid() primary key,
  mieter_id uuid references mieter(id) on delete cascade,
  objekt_id uuid,
  nachricht text,
  richtung text default 'intern',
  autor text,
  created_at timestamp default now()
);

-- Storage Bucket (manuell in Supabase UI anlegen: "dokumente")
-- RLS deaktivieren fuer einfachen Zugriff (fuer produktiven Betrieb anpassen)
alter table objekte disable row level security;
alter table mieter disable row level security;
alter table dokumente disable row level security;
alter table kommunikation disable row level security;
