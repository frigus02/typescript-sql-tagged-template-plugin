interface Data1 {
	prop1: string;
}

interface Data2 {
	prop2: string;
}

export const query = (a: Data1 | Data2) => `${a}`;
