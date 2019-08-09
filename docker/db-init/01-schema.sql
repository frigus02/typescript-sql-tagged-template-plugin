CREATE TABLE users (
    user_id integer PRIMARY KEY,
    first_name text NOT NULL,
    last_name text NOT NULL,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

CREATE TYPE product_category AS ENUM (
    'Sweets',
    'Vegetables',
    'Fruit'
);

CREATE TABLE products (
    product_id integer PRIMARY KEY,
    name text NOT NULL,
    categories product_category[] NOT NULL,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

CREATE TYPE order_status AS ENUM (
    'created',
    'packaged',
    'shipped',
    'received',
    'returned'
);

CREATE TABLE orders (
    order_id integer PRIMARY KEY,
    user_id integer NOT NULL REFERENCES users (user_id),
    notes text NOT NULL,
    status order_status NOT NULL,
    package_data jsonb,
    shipment_data jsonb,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

CREATE TABLE line_items (
    line_item_id integer PRIMARY KEY,
    order_id integer NOT NULL REFERENCES orders (order_id),
    product_id integer NOT NULL REFERENCES products (product_id)
);
