BEGIN;

ALTER TABLE public.member
  DROP CONSTRAINT IF EXISTS member_horse_level_check;

ALTER TABLE public.member
  ADD CONSTRAINT member_horse_level_check
  CHECK (
    horse_level BETWEEN 0 AND 5
    OR (horse = '현풍마' AND horse_level BETWEEN 6 AND 15)
  );

COMMIT;
