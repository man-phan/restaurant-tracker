-- Seed: Locations
INSERT INTO locations (name, created_at) VALUES
  ('District 1',  '2026-01-01'),
  ('District 3',  '2026-01-05'),
  ('District 5',  '2026-01-10'),
  ('District 7',  '2026-01-12'),
  ('District 10', '2026-02-01'),
  ('District 11', '2026-02-14'),
  ('Binh Thanh',  '2026-03-01'),
  ('Thu Duc',     '2026-03-10');

-- Seed: Restaurants
-- We reference locations by name sub-select so order doesn't matter
INSERT INTO restaurants (name, address, full_address, location_id, created_at) VALUES
  ('Quan Bo Ne Co Hai',       '123 Nguyen Trai, Ward 2',        '123 Nguyen Trai, Ward 2, District 5, Ho Chi Minh City',        (SELECT id FROM locations WHERE name='District 5'),  '2026-05-10'),
  ('Pho Hung Vuong',          '456 Tran Hung Dao, Ward 7',      '456 Tran Hung Dao, Ward 7, District 5, Ho Chi Minh City',      (SELECT id FROM locations WHERE name='District 5'),  '2026-05-15'),
  ('Com Tam Ba Ghien',        '78 Vo Van Tan, Ward 6',          '78 Vo Van Tan, Ward 6, District 3, Ho Chi Minh City',          (SELECT id FROM locations WHERE name='District 3'),  '2026-06-01'),
  ('Kem Bac Lieu',            '12 Nguyen Cu Trinh, Ward 2',     '12 Nguyen Cu Trinh, Ward 2, District 1, Ho Chi Minh City',     (SELECT id FROM locations WHERE name='District 1'),  '2026-06-10'),
  ('Lau De Tan Dinh',         '99 Dinh Tien Hoang, Ward 1',     '99 Dinh Tien Hoang, Ward 1, District 1, Ho Chi Minh City',     (SELECT id FROM locations WHERE name='District 1'),  '2026-06-20'),
  ('Quan Chao Long',          '34 Le Hong Phong, Ward 4',       '34 Le Hong Phong, Ward 4, District 10, Ho Chi Minh City',      (SELECT id FROM locations WHERE name='District 10'), '2026-07-01'),
  ('Kem Socola House',        '56 Nguyen Thien Thuat, Ward 3',  '56 Nguyen Thien Thuat, Ward 3, District 3, Ho Chi Minh City',  (SELECT id FROM locations WHERE name='District 3'),  '2026-07-05'),
  ('Banh Mi Huynh Hoa',       '26 Le Thi Rieng, Ward 3',        '26 Le Thi Rieng, Ward 3, District 1, Ho Chi Minh City',        (SELECT id FROM locations WHERE name='District 1'),  '2026-07-15'),
  ('Hu Tieu Nam Vang Co Thanh','189 Bach Dang, Ward 24',        '189 Bach Dang, Ward 24, Binh Thanh, Ho Chi Minh City',         (SELECT id FROM locations WHERE name='Binh Thanh'),  '2026-07-18'),
  ('Bo Kho Phan Dinh Phung',  '22 Phan Dinh Phung, Ward 1',     '22 Phan Dinh Phung, Ward 1, District 11, Ho Chi Minh City',    (SELECT id FROM locations WHERE name='District 11'), '2026-07-20');

-- Seed: Dishes
INSERT INTO dishes (restaurant_id, name, rating, note, created_at) VALUES
  ((SELECT id FROM restaurants WHERE name='Quan Bo Ne Co Hai'),        'Bo Ne',                 4, 'Delicious, ask for less salty next time',  '2026-05-10'),
  ((SELECT id FROM restaurants WHERE name='Quan Bo Ne Co Hai'),        'Banh Mi',               3, 'Normal, bread is fresh though',            '2026-05-11'),
  ((SELECT id FROM restaurants WHERE name='Quan Bo Ne Co Hai'),        'Trung Op La',           5, 'Perfect runny yolk!',                      '2026-05-12'),
  ((SELECT id FROM restaurants WHERE name='Pho Hung Vuong'),           'Bo Kho',                5, 'Very good, broth is rich and deep',        '2026-05-15'),
  ((SELECT id FROM restaurants WHERE name='Pho Hung Vuong'),           'Pho Bo',                4, 'Great noodles, ask for extra tendon',      '2026-05-16'),
  ((SELECT id FROM restaurants WHERE name='Com Tam Ba Ghien'),         'Com Tam Suon Bi Cha',   5, 'Classic, best in District 3',              '2026-06-01'),
  ((SELECT id FROM restaurants WHERE name='Com Tam Ba Ghien'),         'Nuoc Mam',              4, 'Perfect dipping sauce ratio',              '2026-06-01'),
  ((SELECT id FROM restaurants WHERE name='Kem Bac Lieu'),             'Kem Dua',               5, 'Creamy and authentic coconut flavor',      '2026-06-10'),
  ((SELECT id FROM restaurants WHERE name='Kem Bac Lieu'),             'Kem Socola',            4, 'Rich chocolate, not too sweet',            '2026-06-11'),
  ((SELECT id FROM restaurants WHERE name='Kem Bac Lieu'),             'Kem Dau',               3, 'A bit icy, not as smooth',                 '2026-06-12'),
  ((SELECT id FROM restaurants WHERE name='Lau De Tan Dinh'),          'Lau De',                4, 'Spicy broth, lots of vegetables',          '2026-06-20'),
  ((SELECT id FROM restaurants WHERE name='Lau De Tan Dinh'),          'De Nuong',              5, 'Smoky and tender, must order!',            '2026-06-21'),
  ((SELECT id FROM restaurants WHERE name='Quan Chao Long'),           'Chao Long',             4, 'Warm and comforting',                      '2026-07-01'),
  ((SELECT id FROM restaurants WHERE name='Kem Socola House'),         'Kem Tuoi',              4, 'Fresh milk ice cream, very smooth',        '2026-07-05'),
  ((SELECT id FROM restaurants WHERE name='Kem Socola House'),         'Kem Matcha',            5, 'Strong matcha flavor, love it',            '2026-07-06'),
  ((SELECT id FROM restaurants WHERE name='Banh Mi Huynh Hoa'),        'Banh Mi Dac Biet',      5, 'Iconic, overstuffed with everything',      '2026-07-15'),
  ((SELECT id FROM restaurants WHERE name='Hu Tieu Nam Vang Co Thanh'),'Hu Tieu Nam Vang',      4, 'Clear broth, very fresh',                  '2026-07-18'),
  ((SELECT id FROM restaurants WHERE name='Bo Kho Phan Dinh Phung'),   'Bo Kho Banh Mi',        5, 'Best bo kho I have ever had',              '2026-07-20'),
  ((SELECT id FROM restaurants WHERE name='Bo Kho Phan Dinh Phung'),   'Bo Kho Mi',             4, 'Good noodles, tender beef',                '2026-07-20');
