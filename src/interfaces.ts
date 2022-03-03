export interface ITicTacToe {
	id: string;
	created_at: Date;
	last_move: string | null;
	players: string[];
	matrix: string[][];
}
