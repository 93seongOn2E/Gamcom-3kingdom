BEGIN;

ALTER TABLE public.castle
  ADD COLUMN IF NOT EXISTS is_occupied boolean NOT NULL DEFAULT false;

UPDATE public.castle
SET is_use = false,
    is_occupied = false,
    updated_at = now();

WITH territory_layout (number, row_index, column_index) AS (
  VALUES
    (1,0,6),(2,0,7),
    (3,1,2),(4,1,3),(5,1,4),(6,1,5),(7,1,6),(8,1,7),(9,1,8),(10,1,9),
    (11,2,2),(12,2,3),(13,2,5),(14,2,6),(15,2,7),(16,2,8),
    (17,3,3),(18,3,4),(19,3,5),(20,3,6),(21,3,8),(22,3,9),(23,3,10),
    (24,4,2),(25,4,3),(26,4,4),(27,4,5),(28,4,6),(29,4,7),(30,4,9),(31,4,10),
    (32,5,1),(33,5,2),(34,5,4),(35,5,5),(36,5,6),(37,5,7),(38,5,8),(39,5,9),
    (40,6,0),(41,6,1),(42,6,2),(43,6,3),(44,6,4),(45,6,5),(46,6,7),(47,6,8),(48,6,9),
    (49,7,1),(50,7,2),(51,7,3),(52,7,4),(53,7,6),(54,7,7),(55,7,8),(56,7,9),
    (57,8,4),(58,8,5),(59,8,6),(60,8,7)
),
territory_rows AS (
  SELECT
    number,
    row_index,
    column_index,
    CASE
      WHEN number <= 20 THEN '위-' || lpad(number::text, 3, '0')
      WHEN number <= 40 THEN '촉-' || lpad((number - 20)::text, 3, '0')
      ELSE '오-' || lpad((number - 40)::text, 3, '0')
    END AS castle_key
  FROM territory_layout
)
UPDATE public.castle AS castle
SET name = territory.number::text,
    kingdom = CASE
      WHEN territory.number = 8 THEN '위'
      WHEN territory.number = 42 THEN '촉'
      WHEN territory.number = 47 THEN '오'
      WHEN territory.number <= 20 THEN '위'
      WHEN territory.number <= 40 THEN '촉'
      ELSE '오'
    END,
    level = 3,
    map_x = 310 + territory.column_index * 54,
    map_y = 115 + territory.row_index * 54,
    area_scale = 1,
    sort_order = territory.number,
    is_use = true,
    is_occupied = territory.number IN (8, 42, 47),
    updated_at = now()
FROM territory_rows AS territory
WHERE castle.castle_key = territory.castle_key;

COMMIT;
