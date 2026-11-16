-- Part 3: SQL queries for the W3Schools SQL Try-It editor (Northwind sample DB)
-- https://www.w3schools.com/sql/trysql.asp?filename=trysql_select_all
--
-- Assumptions (both queries):
--   * The shipper is matched by name (ShipperName = 'United Package'), not by a
--     hardcoded ShipperID, so the queries stay correct if ids change.
--   * W3Schools' OrderDetails has no unit price column, so order value is
--     Quantity * Products.Price (the product's current price).
--   * Standard SQL only; verified on the Try-It editor's server-side engine
--     (SQL Server) on 2026-11-16: Query 1 -> 45 rows, Query 2 -> 29 rows.
--   * Run one query at a time in the Try-It editor.


-- ---------------------------------------------------------------------------
-- Query 1: Customers who used "United Package", with order count and total value
-- ---------------------------------------------------------------------------
-- Approach: Customers -> Orders -> Shippers (filtered by name) -> OrderDetails
-- -> Products. The join to OrderDetails repeats each order once per line item,
-- so orders are counted with COUNT(DISTINCT o.OrderID). Grouping by CustomerID
-- (plus name and country) keeps two customers with the same name apart, and
-- each customer appears once. Sorted by total value, highest first.
SELECT
    c.CustomerName,
    c.Country,
    COUNT(DISTINCT o.OrderID)       AS OrdersCount,
    SUM(od.Quantity * p.Price)      AS TotalValue
FROM Customers    AS c
JOIN Orders       AS o  ON o.CustomerID = c.CustomerID
JOIN Shippers     AS s  ON s.ShipperID  = o.ShipperID
JOIN OrderDetails AS od ON od.OrderID   = o.OrderID
JOIN Products     AS p  ON p.ProductID  = od.ProductID
WHERE s.ShipperName = 'United Package'
GROUP BY c.CustomerID, c.CustomerName, c.Country
ORDER BY TotalValue DESC;


-- ---------------------------------------------------------------------------
-- Query 2: Customers with at least one order who never used "United Package"
-- ---------------------------------------------------------------------------
-- Approach: look at each customer's whole order history. EXISTS keeps only
-- customers with at least one order; NOT EXISTS drops anyone with any order
-- shipped by United Package. A row-level filter such as ShipperID <> 2 would be
-- wrong: it keeps customers who used United Package on some orders but another
-- shipper on others.
SELECT
    c.CustomerName,
    c.Country
FROM Customers AS c
WHERE EXISTS (
        SELECT 1
        FROM Orders AS o
        WHERE o.CustomerID = c.CustomerID
    )
  AND NOT EXISTS (
        SELECT 1
        FROM Orders   AS o
        JOIN Shippers AS s ON s.ShipperID = o.ShipperID
        WHERE o.CustomerID = c.CustomerID
          AND s.ShipperName = 'United Package'
    )
ORDER BY c.CustomerName;
