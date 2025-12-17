-- Macau Pet-Friendly Eats Database Schema
-- Run this script in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create pet_policy enum type
CREATE TYPE pet_policy AS ENUM (
  'indoors_allowed',
  'patio_only', 
  'small_pets_only',
  'all_pets_welcome',
  'dogs_only',
  'cats_only'
);

-- Create restaurants table
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  pet_policy pet_policy NOT NULL DEFAULT 'patio_only',
  cuisine_type TEXT NOT NULL,
  image_url TEXT,
  contact_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(restaurant_id, user_id) -- One review per user per restaurant
);

-- Create indexes for better query performance
CREATE INDEX idx_restaurants_cuisine ON restaurants(cuisine_type);
CREATE INDEX idx_restaurants_pet_policy ON restaurants(pet_policy);
CREATE INDEX idx_restaurants_location ON restaurants(latitude, longitude);
CREATE INDEX idx_reviews_restaurant ON reviews(restaurant_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Restaurants policies: Anyone can read, only authenticated users can insert (for submissions)
CREATE POLICY "Anyone can view restaurants"
  ON restaurants FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert restaurants"
  ON restaurants FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Reviews policies: Anyone can read, authenticated users can manage their own reviews
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert their own reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for development
INSERT INTO restaurants (name, description, address, latitude, longitude, pet_policy, cuisine_type, image_url, contact_info) VALUES
  (
    'Café Bela Vista',
    'A charming Portuguese café with a beautiful garden terrace perfect for pets. Known for their egg tarts and galão coffee.',
    'Largo do Senado 12, Macau',
    22.1937,
    113.5399,
    'patio_only',
    'Portuguese',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
    '+853 2833 1234'
  ),
  (
    'Garden Bistro',
    'Modern fusion restaurant with an indoor pet-friendly section. Fresh seasonal ingredients with Asian-European fusion.',
    'Rua de São Paulo 45, Macau',
    22.1979,
    113.5413,
    'indoors_allowed',
    'Fusion',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    '+853 2855 5678'
  ),
  (
    'Paws & Plates',
    'The ultimate pet-friendly dining experience! Special pet menu available. All sizes and types of well-behaved pets welcome.',
    'Avenida da Praia Grande 789, Macau',
    22.1894,
    113.5467,
    'all_pets_welcome',
    'International',
    'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800',
    '+853 2877 9012'
  ),
  (
    'Dim Sum Garden',
    'Traditional Cantonese dim sum restaurant with an outdoor courtyard. Small pets allowed on the terrace.',
    'Rua do Almirante Sérgio 23, Macau',
    22.2010,
    113.5445,
    'small_pets_only',
    'Cantonese',
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800',
    '+853 2866 3456'
  ),
  (
    'The Barking Brunch',
    'Weekend brunch spot dedicated to dog lovers. Dog treats and water bowls provided. Indoor and patio seating.',
    'Travessa do Bispo 8, Macau',
    22.1923,
    113.5378,
    'dogs_only',
    'Brunch',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
    '+853 2844 7890'
  ),
  (
    'Seafood Harbour',
    'Fresh seafood restaurant with harbor views. Pets welcome on the spacious outdoor deck.',
    'Avenida de Almeida Ribeiro 156, Macau',
    22.1905,
    113.5521,
    'patio_only',
    'Seafood',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
    '+853 2899 1111'
  );
