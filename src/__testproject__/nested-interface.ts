interface Address {
	street: string;
	city: string;
}

interface User {
	name: string;
	addresses: Address[];
}

export const query = (a: User) => `${a}`;
