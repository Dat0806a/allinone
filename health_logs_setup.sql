-- Tạo bảng lịch sử sức khỏe
create table if not exists health_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    date date default CURRENT_DATE,
    heart_rate int,
    systolic_bp int,
    diastolic_bp int,
    spo2_estimate int,
    note text,
    created_at timestamptz default now(),
    unique(user_id, date)
);

alter table health_logs enable row level security;

-- Policies
create policy "Users can insert own health logs"
on health_logs
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can view own health logs"
on health_logs
for select
to authenticated
using (auth.uid() = user_id);
