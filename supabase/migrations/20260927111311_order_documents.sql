-- ============================================================================
-- order_documents
--
-- The bill and the 3x5 shipping label are rendered from the order itself —
-- no billing copy is stored. This only remembers that the team printed them,
-- so the dashboard can say "Print" the first time and "Reprint · last printed
-- <date>" after, and a label is not stuck on two parcels by mistake.
-- ============================================================================

alter table public.orders
  add column if not exists invoice_print_count integer not null default 0,
  add column if not exists invoice_printed_at  timestamptz,
  add column if not exists label_print_count   integer not null default 0,
  add column if not exists label_printed_at    timestamptz;

alter table public.orders drop constraint if exists orders_print_counts_check;
alter table public.orders add constraint orders_print_counts_check
  check (invoice_print_count >= 0 and label_print_count >= 0);

create or replace function public.record_order_print(p_order_id uuid, p_kind text)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  if not public.is_admin() then
    raise exception 'Only an administrator can print order documents.' using errcode = 'insufficient_privilege';
  end if;

  if p_kind = 'invoice' then
    update public.orders set invoice_print_count = invoice_print_count + 1, invoice_printed_at = now()
     where id = p_order_id returning invoice_print_count into v_count;
  elsif p_kind = 'label' then
    update public.orders set label_print_count = label_print_count + 1, label_printed_at = now()
     where id = p_order_id returning label_print_count into v_count;
  else
    raise exception 'Unknown document.' using errcode = 'check_violation';
  end if;

  if v_count is null then
    raise exception 'Order not found.' using errcode = 'no_data_found';
  end if;
  return v_count;
end;
$$;

revoke execute on function public.record_order_print(uuid, text) from public, anon;
grant execute on function public.record_order_print(uuid, text) to authenticated;
