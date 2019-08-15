export interface Query {
	name?: string;
	text: string;
	values: any[];
}

export const sql = (name: string) => (
	strings: TemplateStringsArray,
	...values: any[]
): Query => ({
	name,
	text: String.raw(strings, ...values.map((_, i) => `$${i + 1}`)),
	values
});

export const createOrder = (userId: string, notes: string | null) => sql(
	"create-order"
)`
	INSERT INTO orders(
		user_id
		notes,
		status,
		created_at,
		updated_at
	) VALUES(
		${userId},
		${notes},
		'created',
		NOW(),
		NOW()
	)
	RETURNING *
`;

export const updateOrderStatus = (orderId: number, newStatus: string) => sql(
	"update-order-status"
)`
	UPDATE
		orders
	SET
		status = ${newStatus},
		updated_at = ${new Date().toISOString()}
	WHERE
		order_id = ${orderId}
`;

export const getOrder = (orderId: number) => sql("get-order")`
	SELECT * FROM orders WHERE order_id = ${orderId}
`;

export const getOutstandingOrdersForUser = (
	orderId: number,
	userId: string
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
		AND o.userid = ${userId}
		AND o.status IN ('created', ${"packaged"}, 'shipped')
`;

export const geOrdersByStatus = (
	statuses: Array<"created" | "packaged" | "received" | "returned" | "shipped">
) => sql("get-orders-by-status")`
	SELECT
		*
	FROM
		orders o
	WHERE
		status = ANY (${statuses})
`;

export const getOrdersByShippingCompany = (company: number) => sql(
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

export const deleteProduct = (productId: string) => sql("delete-product")`
	DELETE FROM products WHERE product_id = ${productId}
`;
