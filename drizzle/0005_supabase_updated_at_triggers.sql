CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON "users"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER items_set_updated_at
BEFORE UPDATE ON "items"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER daily_stock_set_updated_at
BEFORE UPDATE ON "dailyStock"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER sales_set_updated_at
BEFORE UPDATE ON "sales"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
