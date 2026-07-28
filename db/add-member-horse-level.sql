BEGIN;

ALTER TABLE public.member
  ADD COLUMN IF NOT EXISTS horse_level SMALLINT NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'member_horse_level_check'
      AND conrelid = 'public.member'::regclass
  ) THEN
    ALTER TABLE public.member
      ADD CONSTRAINT member_horse_level_check
      CHECK (horse_level BETWEEN 0 AND 5);
  END IF;
END
$$;

UPDATE public.member
SET horse_level = 0
WHERE horse IS NULL
  AND horse_level <> 0;

COMMIT;
