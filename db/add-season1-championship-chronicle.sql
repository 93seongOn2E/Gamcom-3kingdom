INSERT INTO public.chronicle_season1 (
  event_at,
  nation,
  content,
  is_deleted,
  author_name,
  approval_status
)
SELECT
  '2026-08-04 02:00:00+09:00',
  '오나라',
  '삼국통일 시즌1 우승',
  false,
  'system',
  'approved'
WHERE NOT EXISTS (
  SELECT 1
  FROM public.chronicle_season1
  WHERE event_at = '2026-08-04 02:00:00+09:00'
    AND nation = '오나라'
    AND content = '삼국통일 시즌1 우승'
);
