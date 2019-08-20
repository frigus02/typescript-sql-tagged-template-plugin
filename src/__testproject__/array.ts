type Status = "todo" | "in_progress" | "finished";

export const query = (a: Status[]) => `${a}`;
