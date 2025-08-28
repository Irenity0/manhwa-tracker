-- Extra sample manhwa data
INSERT INTO public.manhwa (
  manhwa_title,
  original_title,
  author,
  status,
  star_rating,
  episodes_released,
  episodes_read,
  genres,
  cover_image_url,
  reading_status,
  notes
) VALUES
(
  'Noblesse',
  '노블레스',
  'Son Jeho / Lee Kwangsu',
  'Completed',
  4,
  544,
  120,
  ARRAY['Action', 'Supernatural'],
  '/placeholder.svg?height=200&width=150',
  'On-Hold',
  'Dropped midway, but planning to resume'
),
(
  'Bastard',
  '바스타드',
  'Carnby Kim / Youngchan Hwang',
  'Completed',
  5,
  93,
  93,
  ARRAY['Thriller', 'Psychological'],
  '/placeholder.svg?height=200&width=150',
  'Completed',
  'Creepy but brilliant! One of the best thrillers'
),
(
  'Omniscient Reader’s Viewpoint',
  '전지적 독자 시점',
  'Sing-Shong',
  'Ongoing',
  5,
  NULL,
  120,
  ARRAY['Action', 'Fantasy', 'Psychological'],
  '/placeholder.svg?height=200&width=150',
  'Reading',
  'Kim Dokja supremacy ✨ Complex but amazing'
),
(
  'Sweet Home',
  '스위트 홈',
  'Carnby Kim / Youngchan Hwang',
  'Completed',
  3,
  140,
  60,
  ARRAY['Horror', 'Drama', 'Psychological'],
  '/placeholder.svg?height=200&width=150',
  'Dropped',
  'Good start but didn’t vibe with later parts'
);
