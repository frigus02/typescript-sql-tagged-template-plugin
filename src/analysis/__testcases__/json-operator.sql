SELECT
  order_id,
  notes,
  status
FROM
  orders
WHERE
  shipment_data ->> 'company' = $1
