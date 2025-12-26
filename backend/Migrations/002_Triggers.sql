CREATE OR REPLACE FUNCTION prevent_negative_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stock < 0 THEN
        RAISE EXCEPTION 'Stock cannot be negative';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_negative_stock
BEFORE UPDATE OF stock ON book
FOR EACH ROW
EXECUTE FUNCTION prevent_negative_stock();

CREATE OR REPLACE FUNCTION auto_replenish_order()
RETURNS TRIGGER AS $$
DECLARE
    order_qty INT := 20; -- FIXED order quantity
BEGIN
    IF OLD.stock >= OLD.threshold AND NEW.stock < NEW.threshold THEN
        INSERT INTO replenishment_order (isbn, quantity, status)
        VALUES (NEW.isbn, order_qty, 'Pending');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_replenish
AFTER UPDATE OF stock ON book
FOR EACH ROW
EXECUTE FUNCTION auto_replenish_order();

CREATE OR REPLACE FUNCTION confirm_replenishment()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'Pending' AND NEW.status = 'Confirmed' THEN
        UPDATE book
        SET stock = stock + NEW.quantity
        WHERE isbn = NEW.isbn;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_confirm_replenishment
AFTER UPDATE OF status ON replenishment_order
FOR EACH ROW
EXECUTE FUNCTION confirm_replenishment();
