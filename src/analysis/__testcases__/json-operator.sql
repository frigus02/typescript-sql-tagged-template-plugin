SELECT
  *
FROM
  orders
WHERE
  shipment_data ->> 'company' = $1
