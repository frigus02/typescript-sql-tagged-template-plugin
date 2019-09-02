type Fruit = "Apple" | "Pear" | "Other";

interface Address {
	street: string;
	city: string;
}

interface User {
	name: string;
	addresses: Address[];
	favorites: {
		fruit: Fruit[];
	};
}

export const query = (a: User) => `${a}`;
