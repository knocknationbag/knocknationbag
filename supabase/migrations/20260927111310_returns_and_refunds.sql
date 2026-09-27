-- ============================================================================
-- returns_and_refunds
--
--   1. return_requests / return_items / return_events
--   2. refunds
--   3. create_return_request()   — service role; eligibility decided HERE
--   4. update_return_status()    — admin; the allowed transitions
--   5. begin_refund()            — admin; opens exactly one refund per return
--   6. record_refund_result()    — service role; Razorpay's answer / webhook
--      record_manual_refund()    — admin; COD refunds paid outside the site
--
-- The client's policy, as enforced:
--   * a return can be requested only for a Delivered, paid (COD collected or
--     online paid), domestic (India) order, within 7 days of delivered_at;
--   * the customer must confirm the item is unused, unaltered, in its original
--     packaging and returned with the invoice;
--   * no exchanges or replacements — a return ends in a refund or is closed;
--   * a refund can be opened only after the return was received AND passed
--     inspection, and only by an admin. Nothing refunds automatically.
--
-- Statuses (return_requests.status):
--   Requested → Under Review → Approved → Awaiting Return → Return Received
--     → Inspection Passed → Refund Pending → Refunded → Closed
--   Requested / Under Review → Rejected → Closed
--   Return Received → Inspection Failed → Closed
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Returns
-- ---------------------------------------------------------------------------
create sequence if not exists public.return_number_seq start 1001;

create table if not exists public.return_requests (
  id                   uuid primary key default gen_random_uuid(),
  return_number        text        not null default ('RET-' || nextval('public.return_number_seq')),
  order_id             uuid        not null references public.orders (id) on delete cascade,
  user_id              uuid        references auth.users (id) on delete set null,
  status               text        not null default 'Requested',
  reason               text        not null,
  details              text,
  conditions_confirmed boolean     not null,
  -- Shown to the customer (pickup arrangements, why a request was rejected).
  customer_message     text,
  requested_at         timestamptz not null default now(),
  reviewed_at          timestamptz,
  approved_at          timestamptz,
  received_at          timestamptz,
  inspected_at         timestamptz,
  refunded_at          timestamptz,
  closed_at            timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),

  constraint return_requests_status_check check (status in (
    'Requested', 'Under Review', 'Approved', 'Rejected', 'Awaiting Return', 'Return Received',
    'Inspection Passed', 'Inspection Failed', 'Refund Pending', 'Refunded', 'Closed'
  )),
  constraint return_requests_reason_check     check (reason in ('defective', 'not_satisfied')),
  constraint return_requests_details_length   check (details is null or length(details) <= 1000),
  constraint return_requests_message_length   check (customer_message is null or length(customer_message) <= 1000),
  constraint return_requests_conditions_check check (conditions_confirmed)
);

comment on table public.return_requests is 'Customer return requests. Written only through the return functions below.';

create unique index if not exists return_requests_number_key on public.return_requests (return_number);
create index        if not exists return_requests_order_idx  on public.return_requests (order_id);
create index        if not exists return_requests_status_idx on public.return_requests (status, created_at desc);
create index        if not exists return_requests_user_idx   on public.return_requests (user_id) where user_id is not null;

drop trigger if exists return_requests_set_updated_at on public.return_requests;
create trigger return_requests_set_updated_at before update on public.return_requests
  for each row execute function public.set_updated_at();

create table if not exists public.return_items (
  id            uuid primary key default gen_random_uuid(),
  return_id     uuid    not null references public.return_requests (id) on delete cascade,
  order_item_id uuid    not null references public.order_items (id) on delete cascade,
  quantity      integer not null,

  constraint return_items_quantity_check check (quantity > 0)
);

create unique index if not exists return_items_line_key on public.return_items (return_id, order_item_id);
create index        if not exists return_items_order_item_idx on public.return_items (order_item_id);

-- Timeline. is_internal notes are for the team only and never reach the customer.
create table if not exists public.return_events (
  id          uuid primary key default gen_random_uuid(),
  return_id   uuid        not null references public.return_requests (id) on delete cascade,
  status      text        not null,
  note        text,
  is_internal boolean     not null default false,
  actor_id    uuid        references auth.users (id) on delete set null,
  created_at  timestamptz not null default now(),

  constraint return_events_note_length check (note is null or length(note) <= 1000)
);

create index if not exists return_events_return_idx on public.return_events (return_id, created_at);

-- ---------------------------------------------------------------------------
-- 2. Refunds
-- ---------------------------------------------------------------------------
create table if not exists public.refunds (
  id                 uuid primary key default gen_random_uuid(),
  return_id          uuid           not null references public.return_requests (id) on delete restrict,
  order_id           uuid           not null references public.orders (id) on delete restrict,
  amount             numeric(10, 2) not null,
  method             text           not null,
  status             text           not null default 'pending',
  razorpay_refund_id text,
  reference          text,
  failure_reason     text,
  initiated_by       uuid           references auth.users (id) on delete set null,
  processed_at       timestamptz,
  created_at         timestamptz    not null default now(),
  updated_at         timestamptz    not null default now(),

  constraint refunds_amount_check    check (amount > 0),
  constraint refunds_method_check    check (method in ('razorpay', 'manual')),
  constraint refunds_status_check    check (status in ('pending', 'processed', 'failed')),
  constraint refunds_reference_length check (reference is null or length(reference) <= 200)
);

comment on column public.refunds.method is 'razorpay: back to the original online payment. manual: a COD refund the team paid outside the site and recorded here.';

create unique index if not exists refunds_razorpay_key on public.refunds (razorpay_refund_id) where razorpay_refund_id is not null;
-- The duplicate-refund guard: one live (pending or processed) refund per return.
create unique index if not exists refunds_one_live_per_return on public.refunds (return_id) where status in ('pending', 'processed');
create index        if not exists refunds_order_idx on public.refunds (order_id);

drop trigger if exists refunds_set_updated_at on public.refunds;
create trigger refunds_set_updated_at before update on public.refunds
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS. Customers read their own (through the order they placed); only the
-- functions below write. Guests read through the server by order token.
-- ---------------------------------------------------------------------------
alter table public.return_requests enable row level security;
alter table public.return_items    enable row level security;
alter table public.return_events   enable row level security;
alter table public.refunds         enable row level security;

drop policy if exists "return_requests: read" on public.return_requests;
drop policy if exists "return_items: read"    on public.return_items;
drop policy if exists "return_events: read"   on public.return_events;
drop policy if exists "refunds: read"         on public.refunds;

create policy "return_requests: read"
  on public.return_requests for select to authenticated
  using (public.is_admin() or exists (
    select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()
  ));

create policy "return_items: read"
  on public.return_items for select to authenticated
  using (exists (
    select 1 from public.return_requests r join public.orders o on o.id = r.order_id
     where r.id = return_id and (o.user_id = auth.uid() or public.is_admin())
  ));

create policy "return_events: read"
  on public.return_events for select to authenticated
  using (public.is_admin() or (not is_internal and exists (
    select 1 from public.return_requests r join public.orders o on o.id = r.order_id
     where r.id = return_id and o.user_id = auth.uid()
  )));

create policy "refunds: read"
  on public.refunds for select to authenticated
  using (public.is_admin() or exists (
    select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()
  ));

revoke all on public.return_requests, public.return_items, public.return_events, public.refunds from anon;
revoke insert, update, delete, truncate on public.return_requests, public.return_items, public.return_events, public.refunds from authenticated;
grant select on public.return_requests, public.return_items, public.return_events, public.refunds to authenticated;
grant all on public.return_requests, public.return_items, public.return_events, public.refunds to service_role;
grant usage on sequence public.return_number_seq to service_role;

-- ---------------------------------------------------------------------------
-- 3. create_return_request — the eligibility rules.
--
-- Called by the server with the service role AFTER it has established that the
-- caller owns the order (signed-in RLS read, or the guest's order token).
-- p_user_id, when given, must also match the order — defence in depth.
-- p_items: [{ "order_item_id": uuid, "quantity": int }].
-- ---------------------------------------------------------------------------
create or replace function public.create_return_request(
  p_order_id uuid, p_user_id uuid, p_items jsonb, p_reason text, p_details text, p_conditions_confirmed boolean
)
returns table (return_id uuid, return_number text)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_order  public.orders%rowtype;
  v_return public.return_requests%rowtype;
  line     record;
  v_item   public.order_items%rowtype;
  v_taken  integer;
  v_count  integer := 0;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'ORDER_NOT_FOUND' using errcode = 'P0001';
  end if;
  if p_user_id is not null and v_order.user_id is distinct from p_user_id then
    raise exception 'ORDER_NOT_FOUND' using errcode = 'P0001';
  end if;

  if v_order.status <> 'Delivered' or v_order.delivered_at is null then
    raise exception 'NOT_DELIVERED' using errcode = 'P0001';
  end if;
  if now() > v_order.delivered_at + interval '7 days' then
    raise exception 'WINDOW_CLOSED' using errcode = 'P0001';
  end if;
  if coalesce(v_order.shipping_address ->> 'country', 'India') <> 'India' then
    raise exception 'NOT_DOMESTIC' using errcode = 'P0001';
  end if;
  if v_order.payment_status = 'refunded' then
    raise exception 'ALREADY_REFUNDED' using errcode = 'P0001';
  end if;
  if v_order.payment_status <> 'paid' then
    raise exception 'NOT_PAID' using errcode = 'P0001';
  end if;
  if coalesce(p_reason, '') not in ('defective', 'not_satisfied') then
    raise exception 'INVALID_REASON' using errcode = 'P0001';
  end if;
  if not coalesce(p_conditions_confirmed, false) then
    raise exception 'CONDITIONS_NOT_CONFIRMED' using errcode = 'P0001';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'NO_ITEMS' using errcode = 'P0001';
  end if;

  insert into public.return_requests (order_id, user_id, reason, details, conditions_confirmed)
  values (v_order.id, v_order.user_id, p_reason, nullif(btrim(coalesce(p_details, '')), ''), true)
  returning * into v_return;

  -- Duplicate lines in the request are summed, then checked against what is
  -- left to return: an item already in a live (not rejected) return counts.
  for line in
    select (e ->> 'order_item_id')::uuid as order_item_id, sum((e ->> 'quantity')::integer)::integer as quantity
      from jsonb_array_elements(p_items) e
     group by 1
  loop
    if line.quantity is null or line.quantity <= 0 then
      continue;
    end if;
    select * into v_item from public.order_items where id = line.order_item_id and order_id = v_order.id;
    if not found then
      raise exception 'INVALID_ITEM' using errcode = 'P0001';
    end if;

    select coalesce(sum(ri.quantity), 0)::integer into v_taken
      from public.return_items ri
      join public.return_requests rr on rr.id = ri.return_id
     where ri.order_item_id = v_item.id and rr.status <> 'Rejected' and rr.id <> v_return.id;

    if line.quantity > v_item.quantity - v_taken then
      raise exception 'ALREADY_REQUESTED:%', v_item.product_name using errcode = 'P0001';
    end if;

    insert into public.return_items (return_id, order_item_id, quantity) values (v_return.id, v_item.id, line.quantity);
    v_count := v_count + 1;
  end loop;

  if v_count = 0 then
    raise exception 'NO_ITEMS' using errcode = 'P0001';
  end if;

  insert into public.return_events (return_id, status, actor_id) values (v_return.id, 'Requested', v_order.user_id);

  return query select v_return.id, v_return.return_number;
end;
$$;

revoke execute on function public.create_return_request(uuid, uuid, jsonb, text, text, boolean) from public, anon, authenticated;
grant execute on function public.create_return_request(uuid, uuid, jsonb, text, text, boolean) to service_role;

-- ---------------------------------------------------------------------------
-- 4. update_return_status — admin. Refund Pending / Refunded are reached only
-- through the refund functions, never set by hand.
-- ---------------------------------------------------------------------------
create or replace function public.update_return_status(
  p_return_id uuid, p_status text, p_customer_message text default null, p_internal_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_return  public.return_requests%rowtype;
  v_allowed text[];
  v_message text := nullif(btrim(coalesce(p_customer_message, '')), '');
  v_note    text := nullif(btrim(coalesce(p_internal_note, '')), '');
begin
  if not public.is_admin() then
    raise exception 'Only an administrator can update returns.' using errcode = 'insufficient_privilege';
  end if;

  select * into v_return from public.return_requests where id = p_return_id for update;
  if not found then
    raise exception 'Return not found.' using errcode = 'no_data_found';
  end if;

  v_allowed := case v_return.status
    when 'Requested'         then array['Under Review', 'Approved', 'Rejected']
    when 'Under Review'      then array['Approved', 'Rejected']
    when 'Approved'          then array['Awaiting Return', 'Return Received']
    when 'Awaiting Return'   then array['Return Received']
    when 'Return Received'   then array['Inspection Passed', 'Inspection Failed']
    when 'Inspection Failed' then array['Closed']
    when 'Rejected'          then array['Closed']
    when 'Refunded'          then array['Closed']
    else array[]::text[]
  end;

  if not (p_status = any (v_allowed)) then
    raise exception 'A return that is % cannot be moved to %.', v_return.status, p_status using errcode = 'check_violation';
  end if;
  if p_status = 'Rejected' and v_message is null then
    raise exception 'Tell the customer why the return was rejected.' using errcode = 'check_violation';
  end if;

  update public.return_requests set
    status           = p_status,
    customer_message = coalesce(v_message, customer_message),
    reviewed_at      = case when p_status in ('Under Review', 'Approved', 'Rejected') then coalesce(reviewed_at, now()) else reviewed_at end,
    approved_at      = case when p_status = 'Approved' then now() else approved_at end,
    received_at      = case when p_status = 'Return Received' then now() else received_at end,
    inspected_at     = case when p_status in ('Inspection Passed', 'Inspection Failed') then now() else inspected_at end,
    closed_at        = case when p_status = 'Closed' then now() else closed_at end
  where id = p_return_id;

  insert into public.return_events (return_id, status, note, is_internal, actor_id)
  values (p_return_id, p_status, v_message, false, auth.uid());
  if v_note is not null then
    insert into public.return_events (return_id, status, note, is_internal, actor_id)
    values (p_return_id, p_status, v_note, true, auth.uid());
  end if;
end;
$$;

revoke execute on function public.update_return_status(uuid, text, text, text) from public, anon;
grant execute on function public.update_return_status(uuid, text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 5. begin_refund — admin, after a passed inspection.
--
-- Locks the return and the order, caps the amount at what the order has left
-- to refund, and inserts one pending refund. The partial unique index
-- refunds_one_live_per_return makes a second live refund impossible even if
-- two admins press the button together. A failed refund can be retried.
-- ---------------------------------------------------------------------------
create or replace function public.begin_refund(p_return_id uuid, p_amount numeric)
returns table (refund_id uuid, method text, amount numeric, razorpay_payment_id text, return_number text, order_id uuid, order_number text)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_return    public.return_requests%rowtype;
  v_order     public.orders%rowtype;
  v_amount    numeric := round(coalesce(p_amount, 0), 2);
  v_committed numeric;
  v_method    text;
  v_refund    public.refunds%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Only an administrator can refund.' using errcode = 'insufficient_privilege';
  end if;

  select * into v_return from public.return_requests where id = p_return_id for update;
  if not found then
    raise exception 'Return not found.' using errcode = 'no_data_found';
  end if;
  select * into v_order from public.orders where id = v_return.order_id for update;

  if v_return.status = 'Refund Pending' then
    if exists (select 1 from public.refunds r where r.return_id = p_return_id and r.status in ('pending', 'processed')) then
      raise exception 'A refund for this return is already in progress.' using errcode = 'check_violation';
    end if;
  elsif v_return.status <> 'Inspection Passed' then
    raise exception 'A refund can only be started after the returned product passes inspection.' using errcode = 'check_violation';
  end if;

  if v_order.payment_status <> 'paid' then
    raise exception 'This order has no payment left to refund.' using errcode = 'check_violation';
  end if;

  select coalesce(sum(r.amount), 0) into v_committed
    from public.refunds r where r.order_id = v_order.id and r.status in ('pending', 'processed');
  if v_amount <= 0 then
    raise exception 'Enter a refund amount above zero.' using errcode = 'check_violation';
  end if;
  if v_amount > v_order.total - v_committed then
    raise exception 'The refund cannot be more than % (what is left of the order total).', v_order.total - v_committed using errcode = 'check_violation';
  end if;

  if v_order.payment_method = 'online' then
    if v_order.razorpay_payment_id is null then
      raise exception 'This online order has no recorded payment to refund.' using errcode = 'check_violation';
    end if;
    v_method := 'razorpay';
  else
    v_method := 'manual';
  end if;

  insert into public.refunds (return_id, order_id, amount, method, initiated_by)
  values (v_return.id, v_order.id, v_amount, v_method, auth.uid())
  returning * into v_refund;

  update public.return_requests set status = 'Refund Pending' where id = v_return.id;
  insert into public.return_events (return_id, status, note, is_internal, actor_id)
  values (v_return.id, 'Refund Pending', format('Refund of Rs %s started (%s).', v_amount, v_method), true, auth.uid());

  return query select v_refund.id, v_method, v_amount, v_order.razorpay_payment_id, v_return.return_number, v_order.id, v_order.order_number;
end;
$$;

revoke execute on function public.begin_refund(uuid, numeric) from public, anon;
grant execute on function public.begin_refund(uuid, numeric) to authenticated;

-- ---------------------------------------------------------------------------
-- 6. Recording the outcome. Idempotent: Razorpay's API answer and the
-- refund.processed webhook may both arrive, in either order.
-- ---------------------------------------------------------------------------
create or replace function public.refund_mark_processed(p_refund_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_refund    public.refunds%rowtype;
  v_order     public.orders%rowtype;
  v_processed numeric;
begin
  select * into v_refund from public.refunds where id = p_refund_id for update;
  if not found then
    raise exception 'REFUND_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_refund.status = 'processed' then
    return 'already_processed';
  end if;

  update public.refunds set status = 'processed', processed_at = now(), failure_reason = null where id = v_refund.id;

  update public.return_requests set status = 'Refunded', refunded_at = now()
   where id = v_refund.return_id and status in ('Refund Pending', 'Inspection Passed');
  insert into public.return_events (return_id, status, note, is_internal)
  values (v_refund.return_id, 'Refunded', format('Refund of Rs %s processed.', v_refund.amount), false);

  select * into v_order from public.orders where id = v_refund.order_id for update;
  select coalesce(sum(amount), 0) into v_processed from public.refunds where order_id = v_order.id and status = 'processed';
  if v_processed >= v_order.total and v_order.payment_status = 'paid' then
    update public.orders set payment_status = 'refunded' where id = v_order.id;
  end if;
  return 'processed';
end;
$$;

revoke execute on function public.refund_mark_processed(uuid) from public, anon, authenticated;

create or replace function public.record_refund_result(
  p_refund_id uuid, p_status text, p_razorpay_refund_id text default null, p_failure_reason text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_refund public.refunds%rowtype;
begin
  select * into v_refund from public.refunds where id = p_refund_id for update;
  if not found then
    raise exception 'REFUND_NOT_FOUND' using errcode = 'P0001';
  end if;

  if p_razorpay_refund_id is not null and v_refund.razorpay_refund_id is null then
    update public.refunds set razorpay_refund_id = p_razorpay_refund_id where id = v_refund.id;
  end if;

  if p_status = 'processed' then
    return public.refund_mark_processed(v_refund.id);
  elsif p_status = 'failed' then
    -- A processed refund is never downgraded by a late or duplicate message.
    if v_refund.status = 'pending' then
      update public.refunds set status = 'failed', failure_reason = left(coalesce(p_failure_reason, 'Refund failed.'), 500) where id = v_refund.id;
      insert into public.return_events (return_id, status, note, is_internal)
      values (v_refund.return_id, 'Refund Pending', format('Refund failed: %s', left(coalesce(p_failure_reason, 'no reason given'), 300)), true);
    end if;
    return v_refund.status;
  elsif p_status = 'pending' then
    return 'pending';
  end if;
  raise exception 'UNKNOWN_REFUND_STATUS' using errcode = 'P0001';
end;
$$;

revoke execute on function public.record_refund_result(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.record_refund_result(uuid, text, text, text) to service_role;

-- COD: the money is returned outside the site (bank transfer, UPI, cash); the
-- team records it here with its reference so the order and return close.
create or replace function public.record_manual_refund(p_refund_id uuid, p_reference text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_refund public.refunds%rowtype;
  v_ref    text := nullif(btrim(coalesce(p_reference, '')), '');
begin
  if not public.is_admin() then
    raise exception 'Only an administrator can record refunds.' using errcode = 'insufficient_privilege';
  end if;
  select * into v_refund from public.refunds where id = p_refund_id for update;
  if not found then
    raise exception 'Refund not found.' using errcode = 'no_data_found';
  end if;
  if v_refund.method <> 'manual' then
    raise exception 'Online refunds are confirmed by Razorpay, not recorded by hand.' using errcode = 'check_violation';
  end if;
  if v_refund.status <> 'pending' then
    raise exception 'This refund is already %.', v_refund.status using errcode = 'check_violation';
  end if;
  if v_ref is null then
    raise exception 'Enter the payment reference (UTR, UPI or transfer id).' using errcode = 'check_violation';
  end if;

  update public.refunds set reference = left(v_ref, 200) where id = v_refund.id;
  return public.refund_mark_processed(v_refund.id);
end;
$$;

revoke execute on function public.record_manual_refund(uuid, text) from public, anon;
grant execute on function public.record_manual_refund(uuid, text) to authenticated;
