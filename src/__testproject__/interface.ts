type Status = "todo" | "in_progress" | "finished";

interface Data {
	prop1: string;
	prop2: number;
	prop3: Status;
}

export const query = (a: Data) => `${a}`;
