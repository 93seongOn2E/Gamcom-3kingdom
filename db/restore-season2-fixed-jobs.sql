BEGIN;

UPDATE public.member AS season2
SET job = season1.job,
    updated_at = now()
FROM public.member_season1 AS season1
WHERE season2.nickname = season1.nickname
  AND season1.job IN (
    '조조', '유비', '손권',
    '하후돈', '조자룡', '감녕',
    '장료', '관우', '여몽',
    '전위', '장비', '태사자',
    '사마의', '제갈량', '주유'
  );

COMMIT;
