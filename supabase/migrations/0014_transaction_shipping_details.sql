alter table public.transactions
  add column if not exists shipping_recipient_name text,
  add column if not exists shipping_address_line1 text,
  add column if not exists shipping_address_line2 text,
  add column if not exists shipping_postal_code text,
  add column if not exists shipping_city text,
  add column if not exists shipping_country text,
  add column if not exists shipping_phone text;
