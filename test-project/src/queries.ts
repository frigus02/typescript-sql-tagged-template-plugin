import { OrderStatus, User } from "./db-types";
import { sql } from "./db";

export const createUser = (first_name: string, last_name: string) => sql<User>(
	"create-user"
)`
	INSERT INTO users(
		user_id,
		first_name,
		last_name,
		locales,
		created_at,
		updated_at
	) VALUES(
		${Math.floor(Math.random() * 1000)},
		${first_name},
		${last_name},
		${[]},
		NOW(),
		NOW()
	)
	RETURNING *
`;

export const createOrder = (userId: number, notes: string) => sql(
	"create-order"
)`
	INSERT INTO orders(
		order_id,
		user_id,
		notes,
		status,
		created_at,
		updated_at
	) VALUES(
		${Math.floor(Math.random() * 1000)},
		${userId},
		${notes},
		'created',
		NOW(),
		NOW()
	)
`;

export const updateOrderStatus = (
	orderId: number,
	newStatus: OrderStatus
) => sql("update-order-status")`
	UPDATE
		orders
	SET
		status = ${newStatus},
		updated_at = ${new Date()}
	WHERE
		order_id = ${orderId}
`;

export const getOrder = (orderId: number) => sql("get-order")`
	SELECT * FROM orders WHERE order_id = ${orderId}
`;

export const getOutstandingOrdersForUser = (
	orderId: number,
	userId: number
) => sql("get-outstanding-orders-for-user")`
	SELECT
		o.order_id,
		o.notes,
		o.created_at AS order_created_at,
		o.status,
		u.user_id,
		u.first_name,
		u.last_name
	FROM
		orders o
		LEFT JOIN users u ON o.user_id = u.user_id
	WHERE
		o.order_id = ${orderId}
		AND o.user_id = ${userId}
		AND o.status IN ('created', ${"packaged"}, 'shipped')
`;

export const geOrdersByStatus = (statuses: OrderStatus[]) => sql(
	"get-orders-by-status"
)`
	SELECT
		*
	FROM
		orders o
	WHERE
		status = ANY (${statuses})
`;

export const getOrdersByShippingCompany = (company: string) => sql(
	"get-orders-by-shipping-company"
)`
	SELECT
		user_id,
		name
	FROM
		orders
	WHERE
		status >= 'shipped'
	AND
		shipment_data ->> 'company' = ${company}
`;

interface ShipmentData {
	company: string;
	other: string;
	things: number;
}

export const updateShipmentData = (orderId: number, data: ShipmentData) => sql(
	"update-shipment-data"
)`
	UPDATE
		orders
	SET
		shipment_data = ${data}
	WHERE
		order_id = ${orderId}
`;

export const deleteProduct = (productId: number) => sql("delete-product")`
	DELETE FROM products WHERE product_id = ${productId}
`;
