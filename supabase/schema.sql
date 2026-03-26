-- ============================================================
--  Finanças Pessoais — Schema Supabase
--  Execute este script no SQL Editor do seu projeto Supabase
-- ============================================================

-- ── Profiles ──────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid        primary key references auth.users(id) on delete cascade,
  name       text        not null,
  phone      text,
  avatar     text,        -- base64 da imagem de perfil
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "profiles_select" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- ── Categories ─────────────────────────────────────────────────────────────
create table if not exists public.categories (
  id         text        not null,
  user_id    uuid        not null references auth.users(id) on delete cascade,
  name       text        not null,
  type       text        not null,
  is_default boolean     default false not null,
  created_at timestamptz default now() not null,
  primary key (id, user_id)
);

alter table public.categories enable row level security;
create policy "categories_all" on public.categories for all using (auth.uid() = user_id);

-- ── Transactions ───────────────────────────────────────────────────────────
create table if not exists public.transactions (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null references auth.users(id) on delete cascade,
  description       text        not null,
  amount            numeric     not null,
  type              text        not null,
  category_id       text,
  date              date        not null,
  recurrent         boolean     default false,
  recurrence_day    integer,
  installments      integer,
  installment_index integer,
  end_date          date,
  notes             text,
  created_at        timestamptz default now() not null
);

alter table public.transactions enable row level security;
create policy "transactions_all" on public.transactions for all using (auth.uid() = user_id);

-- ── Investment Goals ───────────────────────────────────────────────────────
create table if not exists public.investment_goals (
  id                   uuid        primary key default gen_random_uuid(),
  user_id              uuid        not null references auth.users(id) on delete cascade,
  name                 text        not null,
  target_amount        numeric     not null,
  current_amount       numeric     default 0 not null,
  monthly_contribution numeric     not null,
  start_date           date        default current_date not null,
  created_at           timestamptz default now() not null
);

alter table public.investment_goals enable row level security;
create policy "goals_all" on public.investment_goals for all using (auth.uid() = user_id);

-- ── Payment Status ─────────────────────────────────────────────────────────
create table if not exists public.payment_status (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references auth.users(id) on delete cascade,
  transaction_id uuid        not null,
  year_month     text        not null,
  paid_at        timestamptz default now() not null,
  unique(user_id, transaction_id, year_month)
);

alter table public.payment_status enable row level security;
create policy "payment_status_all" on public.payment_status for all using (auth.uid() = user_id);

-- ── User Preferences ───────────────────────────────────────────────────────
create table if not exists public.user_preferences (
  user_id          uuid        primary key references auth.users(id) on delete cascade,
  besteiras_config jsonb,
  updated_at       timestamptz default now() not null
);

alter table public.user_preferences enable row level security;
create policy "preferences_all" on public.user_preferences for all using (auth.uid() = user_id);

-- ── Auto-criar perfil após cadastro ───────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
--  USUÁRIO ADMIN PARA TESTES
--  Crie manualmente pelo Supabase Dashboard:
--  Authentication → Users → Add User
--    Email: admin@financas.app
--    Password: admin123
--    (marque "Auto Confirm User" para pular verificação de email)
-- ============================================================
