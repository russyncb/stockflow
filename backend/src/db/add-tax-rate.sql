-- Add tax_rate to existing products table (run if you already have the DB)
ALTER TABLE products ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5, 4) NOT NULL DEFAULT 0;
