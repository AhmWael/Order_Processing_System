-- ========================================
-- Seed Data for Order Processing System
-- ========================================

-- Insert Publishers
INSERT INTO publisher (publisher_id, publisher_name, address) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Penguin Random House', '1745 Broadway, New York, NY 10019'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'HarperCollins', '195 Broadway, New York, NY 10007'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Simon & Schuster', '1230 Avenue of the Americas, New York, NY 10020'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Hachette Book Group', '1290 Avenue of the Americas, New York, NY 10104'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Macmillan Publishers', '120 Broadway, New York, NY 10271'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Oxford University Press', 'Great Clarendon Street, Oxford OX2 6DP, UK'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'Cambridge University Press', 'University Printing House, Cambridge CB2 8BS, UK'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'Wiley', '111 River Street, Hoboken, NJ 07030'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'Springer Nature', 'Tiergartenstrasse 17, 69121 Heidelberg, Germany'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'Scholastic', '557 Broadway, New York, NY 10012');

-- Insert Publisher Phone Numbers
INSERT INTO publisher_phone (publisher_id, phone) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '+1-212-782-9000'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '+1-212-207-7000'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '+1-212-698-7000'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '+1-212-364-1100'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', '+1-646-307-5151'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', '+44-1865-556767'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', '+44-1223-358331'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', '+1-201-748-6000'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', '+49-6221-487-0'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', '+1-212-343-6100');

-- Insert Authors
INSERT INTO author (author_id, author_name) VALUES
-- Science Authors
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Carl Sagan'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Stephen Hawking'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Neil deGrasse Tyson'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Richard Dawkins'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Brian Cox'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Michio Kaku'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'Leonard Mlodinow'),
-- Art Authors
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'Ernst Gombrich'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'John Berger'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'Wassily Kandinsky'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'Sister Wendy Beckett'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a25', 'Robert Hughes'),
-- Religion Authors
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'Karen Armstrong'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'Huston Smith'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Reza Aslan'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34', 'Elaine Pagels'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a35', 'Joseph Campbell'),
-- History Authors
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41', 'Yuval Noah Harari'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a42', 'Jared Diamond'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a43', 'Barbara Tuchman'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Eric Hobsbawm'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a45', 'David McCullough'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a46', 'Doris Kearns Goodwin'),
-- Geography Authors
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51', 'Tim Marshall'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a52', 'Simon Winchester'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a53', 'Harm de Blij'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a54', 'Jared Diamond'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Peter Frankopan');

-- Insert Books
INSERT INTO book (isbn, title, pub_id, pub_year, price, category, stock, threshold) VALUES
-- Science Books
('9780345539434', 'Cosmos', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1980, 29.99, 'Science', 50, 10),
('9780553109535', 'A Brief History of Time', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1988, 24.99, 'Science', 45, 10),
('9780393609394', 'Astrophysics for People in a Hurry', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 2017, 19.99, 'Science', 60, 15),
('9780198788607', 'The Selfish Gene: 40th Anniversary Edition', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 2016, 27.99, 'Science', 40, 10),
('9780062223548', 'The Universe in Your Hand', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 2017, 22.99, 'Science', 35, 10),
('9780385530835', 'The Future of the Mind', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 2014, 28.99, 'Science', 30, 8),
('9780553384666', 'The Grand Design', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 2010, 26.99, 'Science', 25, 8),

-- Art Books
('9780714832470', 'The Story of Art', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 1995, 39.99, 'Art', 30, 8),
('9780140135152', 'Ways of Seeing', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1972, 18.99, 'Art', 40, 10),
('9780486234113', 'Concerning the Spiritual in Art', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 1977, 15.99, 'Art', 25, 8),
('9780789431851', 'The Story of Painting', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 2000, 35.99, 'Art', 20, 5),
('9780500238196', 'The Shock of the New', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 1991, 32.99, 'Art', 18, 5),

-- Religion Books
('9780345384560', 'A History of God', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1993, 26.99, 'Religion', 35, 10),
('9780061660184', 'The World''s Religions', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 2009, 24.99, 'Religion', 40, 10),
('9780812981483', 'Zealot: The Life and Times of Jesus of Nazareth', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 2013, 22.99, 'Religion', 30, 8),
('9780679724537', 'The Gnostic Gospels', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1989, 19.99, 'Religion', 25, 8),
('9781577315933', 'The Hero with a Thousand Faces', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 2008, 29.99, 'Religion', 28, 8),

-- History Books
('9780062316110', 'Sapiens: A Brief History of Humankind', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 2015, 24.99, 'History', 70, 20),
('9780393317558', 'Guns, Germs, and Steel', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 1999, 28.99, 'History', 50, 15),
('9780345476968', 'The Guns of August', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 2004, 25.99, 'History', 35, 10),
('9780349104843', 'The Age of Revolution', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1995, 27.99, 'History', 30, 8),
('9780743226721', '1776', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 2005, 26.99, 'History', 40, 10),
('9780743270755', 'Team of Rivals', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 2005, 29.99, 'History', 35, 10),

-- Geography Books
('9781783962433', 'Prisoners of Geography', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 2016, 23.99, 'Geography', 45, 12),
('9780060931803', 'The Map That Changed the World', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 2001, 21.99, 'Geography', 30, 8),
('9781442206007', 'Why Geography Matters', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 2012, 26.99, 'Geography', 28, 8),
('9780143117001', 'Collapse: How Societies Choose to Fail or Succeed', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 2011, 29.99, 'Geography', 32, 10),
('9781101912379', 'The Silk Roads: A New History of the World', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 2016, 31.99, 'Geography', 40, 12);

-- Link Books to Authors
INSERT INTO book_author (isbn, author_id) VALUES
-- Science Books
('9780345539434', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),  -- Cosmos by Carl Sagan
('9780553109535', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),  -- A Brief History of Time by Stephen Hawking
('9780393609394', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'),  -- Astrophysics by Neil deGrasse Tyson
('9780198788607', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'),  -- The Selfish Gene by Richard Dawkins
('9780062223548', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15'),  -- The Universe in Your Hand by Brian Cox
('9780385530835', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16'),  -- The Future of the Mind by Michio Kaku
('9780553384666', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),  -- The Grand Design by Stephen Hawking
('9780553384666', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17'),  -- The Grand Design by Leonard Mlodinow (co-author)

-- Art Books
('9780714832470', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21'),  -- The Story of Art by Ernst Gombrich
('9780140135152', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'),  -- Ways of Seeing by John Berger
('9780486234113', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23'),  -- Concerning the Spiritual in Art by Wassily Kandinsky
('9780789431851', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24'),  -- The Story of Painting by Sister Wendy Beckett
('9780500238196', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a25'),  -- The Shock of the New by Robert Hughes

-- Religion Books
('9780345384560', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31'),  -- A History of God by Karen Armstrong
('9780061660184', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32'),  -- The World's Religions by Huston Smith
('9780812981483', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33'),  -- Zealot by Reza Aslan
('9780679724537', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34'),  -- The Gnostic Gospels by Elaine Pagels
('9781577315933', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a35'),  -- The Hero with a Thousand Faces by Joseph Campbell

-- History Books
('9780062316110', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41'),  -- Sapiens by Yuval Noah Harari
('9780393317558', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a42'),  -- Guns, Germs, and Steel by Jared Diamond
('9780345476968', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a43'),  -- The Guns of August by Barbara Tuchman
('9780349104843', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44'),  -- The Age of Revolution by Eric Hobsbawm
('9780743226721', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a45'),  -- 1776 by David McCullough
('9780743270755', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a46'),  -- Team of Rivals by Doris Kearns Goodwin

-- Geography Books
('9781783962433', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51'),  -- Prisoners of Geography by Tim Marshall
('9780060931803', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a52'),  -- The Map That Changed the World by Simon Winchester
('9781442206007', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a53'),  -- Why Geography Matters by Harm de Blij
('9780143117001', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a54'),  -- Collapse by Jared Diamond
('9781101912379', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55');  -- The Silk Roads by Peter Frankopan
