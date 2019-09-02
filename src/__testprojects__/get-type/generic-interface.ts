type Status = "todo" | "in_progress" | "finished";

interface Data<T> {
	prop1: string;
	prop2: number;
	prop3: T;
}

export const query = (a: Data<Status>) => `${a}`;
