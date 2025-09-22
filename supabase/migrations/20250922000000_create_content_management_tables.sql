-- =====================================================
-- Content Management System Database Tables
-- Date: September 22, 2025
-- Description: Creates tables for managing carousel items, testimonials, and ambassadors
-- =====================================================

-- Create carousel_items table
CREATE TABLE carousel_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create testimonials table
CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    image VARCHAR(500) NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ambassadors table
CREATE TABLE ambassadors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image VARCHAR(500) NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_carousel_items_order ON carousel_items(display_order, is_active);
CREATE INDEX idx_testimonials_order ON testimonials(display_order, is_active);
CREATE INDEX idx_ambassadors_order ON ambassadors(display_order, is_active);

-- Seed carousel_items with existing data
INSERT INTO carousel_items (name, display_order) VALUES
('Wigs', 1),
('Gowns', 2),
('Camisoles', 3),
('Shirts', 4),
('Collarettes', 5),
('Bibs', 6),
('NBA Stickers', 7),
('Customised Bags', 8);

-- Seed testimonials with existing data
INSERT INTO testimonials (quote, name, title, image, display_order) VALUES
('I will come up with something soon, but this is just a placeholder of a very nice review, by a customer or related third party.', 'Client1', 'Director of AlphaStream Technologies', '/images/home13.jpeg', 1),
('I will come up with something soon, but this is just a placeholder of a very nice review, by a customer or related third party.', 'Client2', 'Director of AlphaStream Technologies', '/images/home14.jpeg', 2),
('I will come up with something soon, but this is just a placeholder of a very nice review, by a customer or related third party.', 'Client3', 'Director of AlphaStream Technologies', '/images/home15.jpeg', 3),
('I will come up with something soon, but this is just a placeholder of a very nice review, by a customer or related third party.', 'Client4', 'Director of AlphaStream Technologies', '/images/home16.jpeg', 4),
('I will come up with something soon, but this is just a placeholder of a very nice review, by a customer or related third party.', 'Client5', 'Director of AlphaStream Technologies', '/images/home12.jpeg', 5);

-- Seed ambassadors with existing data
INSERT INTO ambassadors (name, description, image, display_order) VALUES
('Ambassador 1', 'A long text about the campus ambassadors we have and what they do to influence the business as many words as possible actually so people can know all about them', '/images/home13.jpeg', 1),
('Ambassador 2', 'A long text about the campus ambassadors we have and what they do to influence the business as many words as possible actually so people can know all about them', '/images/home14.jpeg', 2),
('Ambassador 3', 'A long text about the campus ambassadors we have and what they do to influence the business as many words as possible actually so people can know all about them', '/images/home15.jpeg', 3),
('Ambassador 4', 'A long text about the campus ambassadors we have and what they do to influence the business as many words as possible actually so people can know all about them', '/images/home16.jpeg', 4),
('Ambassador 5', 'A long text about the campus ambassadors we have and what they do to influence the business as many words as possible actually so people can know all about them', '/images/home11.jpeg', 5);

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check if tables were created successfully
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('carousel_items', 'testimonials', 'ambassadors');

-- Check seeded data
SELECT 'Carousel Items' as table_name, COUNT(*) as record_count FROM carousel_items
UNION ALL
SELECT 'Testimonials' as table_name, COUNT(*) as record_count FROM testimonials
UNION ALL
SELECT 'Ambassadors' as table_name, COUNT(*) as record_count FROM ambassadors;

-- =====================================================
-- End of Script
-- =====================================================