BEGIN;

ALTER TABLE public.castle
  ADD COLUMN IF NOT EXISTS facility_type varchar(10) NOT NULL DEFAULT '없음';

ALTER TABLE public.castle
  ADD COLUMN IF NOT EXISTS is_capital boolean NOT NULL DEFAULT false;

ALTER TABLE public.castle
  ADD COLUMN IF NOT EXISTS is_cheonrimun boolean NOT NULL DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'castle_facility_type_check'
      AND conrelid = 'public.castle'::regclass
  ) THEN
    ALTER TABLE public.castle
      ADD CONSTRAINT castle_facility_type_check
      CHECK (facility_type IN ('없음', '병영', '성채', '장원'));
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS castle_one_capital_per_kingdom
  ON public.castle (kingdom)
  WHERE is_occupied = true
    AND is_capital = true;

COMMIT;
