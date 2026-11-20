-- Hideas members area: members, $40 credits, referral rules and members-only videos.
-- Run once in the Supabase SQL Editor. Safe to re-run: it only creates what is missing
-- and replaces the functions and policies.

-- ---------- Tables ----------

create table if not exists public.members (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null,
  email text not null,
  location text,
  interest text,
  reason text,
  email_consent boolean not null default false,
  code text not null unique,
  referred_by uuid references public.members (id) on delete set null,
  is_admin boolean not null default false,
  welcome_granted boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.credits (
  id bigint generated always as identity primary key,
  member_id uuid not null references public.members (id) on delete cascade,
  kind text not null check (kind in ('welcome', 'referral')),
  friend_id uuid references public.members (id) on delete set null,
  created_at timestamptz not null default now(),
  used_at timestamptz,
  used_note text
);
-- One welcome credit per member, and one referral credit per friend who joins.
create unique index if not exists credits_one_welcome on public.credits (member_id) where kind = 'welcome';
create unique index if not exists credits_one_per_friend on public.credits (friend_id) where kind = 'referral';
create index if not exists credits_member on public.credits (member_id);

create table if not exists public.member_videos (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  vimeo_url text,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.members enable row level security;
alter table public.credits enable row level security;
alter table public.member_videos enable row level security;

-- ---------- Helpers ----------

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((select m.is_admin from public.members m where m.id = auth.uid()), false)
$$;

create or replace function public.new_member_code()
returns text language plpgsql set search_path = '' as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  c text;
begin
  loop
    c := 'HIDEAS-';
    for i in 1..5 loop
      c := c || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.members where code = c);
  end loop;
  return c;
end $$;

-- Gives a member their welcome credit and, if a friend referred them, the friend's credit.
-- Runs once, when the member's email address is confirmed.
create or replace function public.grant_join_credits(uid uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  ref uuid;
begin
  update public.members set welcome_granted = true
  where id = uid and not welcome_granted
  returning referred_by into ref;
  if not found then
    return;
  end if;
  insert into public.credits (member_id, kind) values (uid, 'welcome') on conflict do nothing;
  if ref is not null and ref <> uid then
    insert into public.credits (member_id, kind, friend_id) values (ref, 'referral', uid) on conflict do nothing;
  end if;
end $$;

-- ---------- Sign-up and confirmation triggers ----------

create or replace function public.handle_new_member()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  ref uuid;
begin
  select id into ref from public.members where code = upper(trim(coalesce(m ->> 'ref_code', '')));
  insert into public.members (id, first_name, email, location, interest, reason, email_consent, code, referred_by)
  values (
    new.id,
    left(coalesce(nullif(trim(m ->> 'first_name'), ''), 'Member'), 80),
    new.email,
    case when m ->> 'location' in ('Vancouver', 'Kelowna', 'West Kelowna', 'Lake Country', 'Vernon', 'Other Central BC')
      then m ->> 'location' end,
    case when m ->> 'interest' in ('Nature Loves Courage', 'Golden Frequency', 'Both') then m ->> 'interest' end,
    left(nullif(trim(m ->> 'reason'), ''), 1000),
    (m ->> 'email_consent') = 'true',
    public.new_member_code(),
    ref
  );
  if new.email_confirmed_at is not null then
    perform public.grant_join_credits(new.id);
  end if;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_member();

create or replace function public.handle_member_confirmed()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if old.email_confirmed_at is null and new.email_confirmed_at is not null then
    perform public.grant_join_credits(new.id);
  end if;
  return new;
end $$;

drop trigger if exists on_auth_user_confirmed on auth.users;
create trigger on_auth_user_confirmed
  after update of email_confirmed_at on auth.users
  for each row execute function public.handle_member_confirmed();

-- ---------- What the website may call ----------

-- Lets the sign-up form check a friend's code without revealing anything else.
create or replace function public.referral_code_valid(c text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.members where code = upper(trim(c)))
$$;

-- Admin only: mark a credit as used (or undo it) when a discounted e-Transfer arrives.
create or replace function public.mark_credit_used(credit_id bigint, note text default null)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'Only the Hideas admin can do this';
  end if;
  update public.credits set used_at = now(), used_note = left(note, 200)
  where id = credit_id and used_at is null;
end $$;

create or replace function public.mark_credit_unused(credit_id bigint)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'Only the Hideas admin can do this';
  end if;
  update public.credits set used_at = null, used_note = null where id = credit_id;
end $$;

revoke execute on function public.new_member_code() from public, anon, authenticated;
revoke execute on function public.grant_join_credits(uuid) from public, anon, authenticated;
revoke execute on function public.handle_new_member() from public, anon, authenticated;
revoke execute on function public.handle_member_confirmed() from public, anon, authenticated;
revoke execute on function public.mark_credit_used(bigint, text) from public, anon;
revoke execute on function public.mark_credit_unused(bigint) from public, anon;
grant execute on function public.mark_credit_used(bigint, text) to authenticated;
grant execute on function public.mark_credit_unused(bigint) to authenticated;
grant execute on function public.referral_code_valid(text) to anon, authenticated;
grant execute on function public.is_admin() to authenticated;

-- ---------- Who can see what ----------

drop policy if exists "Members see their own details" on public.members;
create policy "Members see their own details" on public.members
  for select to authenticated using (id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "Members see their own credits" on public.credits;
create policy "Members see their own credits" on public.credits
  for select to authenticated using (member_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "Members can watch member videos" on public.member_videos;
create policy "Members can watch member videos" on public.member_videos
  for select to authenticated using (true);

drop policy if exists "Admin manages member videos" on public.member_videos;
create policy "Admin manages member videos" on public.member_videos
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- Nobody signed out can read anything, and members can't change their own rows or credits.
revoke all on public.members, public.credits, public.member_videos from anon;
revoke insert, update, delete on public.members, public.credits from authenticated;

-- ---------- Video placeholders ----------

insert into public.member_videos (title, description, sort)
select * from (values
  ('Welcome to Hideas', 'A short welcome from Victory. Video coming soon.', 1),
  ('Preparing for your first ceremony', 'Set and setting, explained. Video coming soon.', 2),
  ('After the ceremony: integration', 'Letting your journey take root. Video coming soon.', 3)
) as v (title, description, sort)
where not exists (select 1 from public.member_videos);
