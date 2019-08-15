SELECT
  *
FROM
  orders
WHERE
  status = ANY($1)
