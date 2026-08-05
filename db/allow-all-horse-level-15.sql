BEGIN;

ALTER TABLE public.member
  DROP CONSTRAINT IF EXISTS member_horse_level_check;

ALTER TABLE public.member
  ADD CONSTRAINT member_horse_level_check
  CHECK (horse_level BETWEEN 0 AND 15);

COMMIT;
