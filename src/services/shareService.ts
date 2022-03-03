export function shareMove(matrix: string[][], type: "move" | "win" | "draw") {
	navigator.share({text: `${printMatrix(matrix)}\n\n${shareMessages[type]}`, url: window.location.href});
}

const printHelper = {
	X: "❌",
	O: "🟡",
	"0": "⬜️",
};

const shareMessages = {
	move: "I've made my move.\nWhat's yours?\n",
	win: "Game over!\nWant to play again?",
	draw: "It's a tie!\nWant to play again?",
};

function printMatrix(matrix: string[][]) {
	return (
		"\n" +
		matrix
			.map((line) => {
				return line.map((item) => `${printHelper[item as "X" | "O" | "0"]}`).join(" | ");
			})
			.join("\n-------------\n")
	);
}
