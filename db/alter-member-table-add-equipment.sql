BEGIN;

CREATE TABLE public.member_new (
  id BIGSERIAL PRIMARY KEY,
  nation VARCHAR(20) NOT NULL CHECK (nation IN ('위나라', '촉나라', '오나라')),
  crew_name VARCHAR(50) NOT NULL,
  nickname VARCHAR(50) NOT NULL UNIQUE,
  role_name VARCHAR(50) NOT NULL DEFAULT '일반 병사',
  job VARCHAR(50),
  weapon INTEGER,
  helmet INTEGER,
  armor INTEGER,
  shoes INTEGER,
  soop_id VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.member_new (
  id,
  nation,
  crew_name,
  nickname,
  role_name,
  job,
  weapon,
  helmet,
  armor,
  shoes,
  soop_id,
  created_at,
  updated_at
)
SELECT
  id,
  nation,
  crew_name,
  nickname,
  CASE
    WHEN nickname IN ('감스트', '조경훈', '지피티') THEN '군주'
    WHEN nickname IN ('꾸티뉴', '박재박', '로기다', '홍타쿠', '가습기') THEN '장군'
    ELSE '일반 병사'
  END AS role_name,
  job,
  weapon,
  helmet,
  armor,
  shoes,
  soop_id,
  created_at,
  updated_at
FROM public.member
ORDER BY id;

SELECT setval(
  pg_get_serial_sequence('public.member_new', 'id'),
  COALESCE((SELECT MAX(id) FROM public.member_new), 1),
  TRUE
);

DROP TABLE public.member;

ALTER TABLE public.member_new RENAME TO member;

CREATE INDEX member_nation_idx ON public.member (nation);
CREATE INDEX member_crew_name_idx ON public.member (crew_name);
CREATE INDEX member_role_name_idx ON public.member (role_name);

COMMIT;
