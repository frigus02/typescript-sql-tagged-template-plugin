export type ProductCategory = "Fruit" | "Sweets" | "Vegetables";

export type OrderStatus =
	| "created"
	| "packaged"
	| "received"
	| "returned"
	| "shipped";

export interface Product {
	product_id: number;
	name: string;
	categories: ProductCategory[];
	created_at: Date;
	updated_at: Date;
}

export interface User {
	user_id: number;
	first_name: string;
	last_name: string;
	locales: string[];
	created_at: Date;
	updated_at: Date;
}

export interface Order {
	order_id: number;
	user_id: number;
	status: OrderStatus;
	notes: string;
	shipment_data: Object | null;
	package_data: Object | null;
	created_at: Date;
	updated_at: Date;
}

export interface LineItem {
	line_item_id: number;
	product_id: number;
	order_id: number;
}
