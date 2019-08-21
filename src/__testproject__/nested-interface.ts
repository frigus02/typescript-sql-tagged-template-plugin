interface Address {
	street: string;
	city: string;
}

interface User {
	name: string;
	address: Address;
}

export const query = (a: User) => `${a}`;
