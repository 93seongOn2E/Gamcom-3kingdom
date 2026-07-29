BEGIN;

DELETE FROM public.castle
WHERE name !~ '^[0-9]+$';

DROP INDEX IF EXISTS public.castle_one_capital_per_kingdom;

ALTER TABLE public.castle
  DROP COLUMN IF EXISTS area_scale,
  DROP COLUMN IF EXISTS sort_order,
  DROP COLUMN IF EXISTS is_use;

CREATE UNIQUE INDEX IF NOT EXISTS castle_one_capital_per_kingdom
  ON public.castle (kingdom)
  WHERE is_occupied = true
    AND is_capital = true;

COMMIT;
