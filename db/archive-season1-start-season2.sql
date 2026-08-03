BEGIN;

CREATE TABLE IF NOT EXISTS public.app_data_migration (
  migration_key varchar(100) PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.member_season1
  (LIKE public.member INCLUDING ALL);

CREATE TABLE IF NOT EXISTS public.castle_season1
  (LIKE public.castle INCLUDING ALL);

CREATE TABLE IF NOT EXISTS public.chronicle_season1
  (LIKE public.chronicle INCLUDING ALL);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.app_data_migration
    WHERE migration_key = 'archive-season1-start-season2'
  ) THEN
    INSERT INTO public.member_season1 SELECT * FROM public.member;
    INSERT INTO public.castle_season1 SELECT * FROM public.castle;
    INSERT INTO public.chronicle_season1 SELECT * FROM public.chronicle;

    UPDATE public.member
    SET job = CASE
          WHEN job IN (
            '조조', '유비', '손권',
            '하후돈', '조자룡', '감녕',
            '장료', '관우', '여몽',
            '전위', '장비', '태사자',
            '사마의', '제갈량', '주유'
          ) THEN job
          ELSE NULL
        END,
        horse = NULL,
        horse_level = 0,
        weapon = NULL,
        helmet = NULL,
        armor = NULL,
        shoes = NULL,
        stat_strength = 0,
        stat_agility = 0,
        stat_vitality = 0,
        stat_intelligence = 0,
        updated_at = now();

    UPDATE public.castle
    SET is_occupied = false,
        is_capital = false,
        is_cheonrimun = false,
        facility_type = '없음',
        updated_at = now();

    DELETE FROM public.chronicle;

    INSERT INTO public.app_data_migration (migration_key)
    VALUES ('archive-season1-start-season2');
  END IF;
END
$$;

COMMIT;
