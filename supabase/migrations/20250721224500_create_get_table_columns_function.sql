CREATE OR REPLACE FUNCTION get_table_columns(p_table_name TEXT, p_table_schema TEXT)
RETURNS TABLE(column_name TEXT, data_type TEXT, is_nullable TEXT, column_default TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.column_name::text,
        c.data_type::text,
        c.is_nullable::text,
        c.column_default::text
    FROM
        information_schema.columns c
    WHERE
        c.table_name = p_table_name AND c.table_schema = p_table_schema;
END;
$$ LANGUAGE plpgsql;
