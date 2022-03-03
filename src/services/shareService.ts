export function shareMove(matrix: string[][]) {
	navigator.share({text: `${printMatrix(matrix)}\n\nI've made my move.\nWhat's yours?\n`, url: window.location.href});
}

const printHelper = {
	X: "❌",
	O: "🟡",
	"0": "⬜️",
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
