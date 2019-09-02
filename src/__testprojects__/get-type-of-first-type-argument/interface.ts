interface Query<T> {
	_?: T;
}

interface User {
	name: string;
}

const tag = <T>(_: TemplateStringsArray, ...__: any[]): Query<T> => ({});

export const query = () => tag<User>``;
