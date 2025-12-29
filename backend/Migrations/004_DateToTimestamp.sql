-- Migration to change DATE columns to TIMESTAMPTZ for timezone support
-- This ensures proper handling of timezone offsets in frontend/backend
-- TIMESTAMPTZ stores timestamps in UTC internally and converts based on timezone

-- Alter customer_order table
ALTER TABLE customer_order 
ALTER COLUMN order_date TYPE TIMESTAMPTZ 
USING order_date::TIMESTAMPTZ;

ALTER TABLE customer_order 
ALTER COLUMN order_date SET DEFAULT CURRENT_TIMESTAMP;

-- Alter replenishment_order table
ALTER TABLE replenishment_order 
ALTER COLUMN order_date TYPE TIMESTAMPTZ 
USING order_date::TIMESTAMPTZ;

ALTER TABLE replenishment_order 
ALTER COLUMN order_date SET DEFAULT CURRENT_TIMESTAMP;
