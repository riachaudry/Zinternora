-- Run once on an existing Supabase database.
ALTER TYPE public.payment_method RENAME TO payment_method_old;
CREATE TYPE public.payment_method AS ENUM ('jazzcash','bank_transfer');
ALTER TABLE public.payments ALTER COLUMN method TYPE public.payment_method USING (method::text::public.payment_method);
DROP TYPE public.payment_method_old;
