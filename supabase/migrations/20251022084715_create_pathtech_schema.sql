/*
  # PathTech Academy Database Schema

  1. New Tables
    - `courses`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `level` (text) - Bac, Université, Professionnel
      - `category` (text) - Informatique, Bureautique, IA, etc.
      - `thumbnail_url` (text)
      - `youtube_playlist_url` (text, optional)
      - `price` (numeric, optional for future)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `instructors`
      - `id` (uuid, primary key)
      - `name` (text)
      - `expertise` (text)
      - `photo_url` (text)
      - `bio` (text, optional)
      - `created_at` (timestamptz)
    
    - `testimonials`
      - `id` (uuid, primary key)
      - `student_name` (text)
      - `content` (text)
      - `rating` (int, 1-5)
      - `created_at` (timestamptz)
    
    - `newsletter_subscribers`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `subscribed_at` (timestamptz)
    
    - `contact_messages`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `message` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access on courses, instructors, and testimonials
    - Add policies for authenticated insert on contact_messages and newsletter_subscribers
*/

CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  level text NOT NULL,
  category text NOT NULL,
  thumbnail_url text DEFAULT '',
  youtube_playlist_url text,
  price numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS instructors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  expertise text NOT NULL,
  photo_url text DEFAULT '',
  bio text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  content text NOT NULL,
  rating int DEFAULT 5,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view courses"
  ON courses FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view instructors"
  ON instructors FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view testimonials"
  ON testimonials FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can send contact messages"
  ON contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);