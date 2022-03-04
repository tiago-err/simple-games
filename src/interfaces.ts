export interface IMatrixGame {
	id: string;
	created_at: Date;
	last_move: string | null;
	matrix: string[][];
}
