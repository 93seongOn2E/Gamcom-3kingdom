BEGIN;

ALTER TABLE public.castle
  ADD COLUMN IF NOT EXISTS is_cheonrimun boolean NOT NULL DEFAULT false;

UPDATE public.castle
SET is_cheonrimun = true,
    facility_type = '없음'
WHERE facility_type = '천리문';

ALTER TABLE public.castle
  DROP CONSTRAINT IF EXISTS castle_facility_type_check;

ALTER TABLE public.castle
  ADD CONSTRAINT castle_facility_type_check
  CHECK (facility_type IN ('없음', '병영', '성채', '장원'));

COMMIT;
