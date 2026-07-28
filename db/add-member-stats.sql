BEGIN;

ALTER TABLE public.member
  ADD COLUMN IF NOT EXISTS stat_strength INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stat_agility INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stat_vitality INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stat_intelligence INTEGER NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'member_stat_strength_check'
      AND conrelid = 'public.member'::regclass
  ) THEN
    ALTER TABLE public.member
      ADD CONSTRAINT member_stat_strength_check CHECK (stat_strength >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'member_stat_agility_check'
      AND conrelid = 'public.member'::regclass
  ) THEN
    ALTER TABLE public.member
      ADD CONSTRAINT member_stat_agility_check CHECK (stat_agility >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'member_stat_vitality_check'
      AND conrelid = 'public.member'::regclass
  ) THEN
    ALTER TABLE public.member
      ADD CONSTRAINT member_stat_vitality_check CHECK (stat_vitality >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'member_stat_intelligence_check'
      AND conrelid = 'public.member'::regclass
  ) THEN
    ALTER TABLE public.member
      ADD CONSTRAINT member_stat_intelligence_check CHECK (stat_intelligence >= 0);
  END IF;
END
$$;

COMMIT;
