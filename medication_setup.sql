-- SQL cho bảng medication_schedules
create table if not exists medication_schedules (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    medicine_name text not null,
    dosage text,
    times text[] not null,
    days text[] default '{}',
    note text,
    icon text default '💊',
    color text default 'bg-orange-50',
    start_date date,
    end_date date,
    created_at timestamptz default now()
);

alter table medication_schedules enable row level security;

-- Policies
create policy "Users can insert own schedules"
on medication_schedules
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can view own schedules"
on medication_schedules
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can delete own schedules"
on medication_schedules
for delete
to authenticated
using (auth.uid() = user_id);
