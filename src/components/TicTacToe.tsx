import {useEffect, useState} from "react";
import transposeMatrix from "../utils/transposeMatrix";

export default function TicTacToe(props: {
	matrix: string[][];
	lastMove: string | null;
	gameUpdater: (matrix: string[][], lastMove: string | null) => void;
}) {
	const [matrix, setMatrix] = useState(props.matrix);
	const [lastMove, setLastMove] = useState(props.lastMove);
	const [winningPositions, setWinningPositions] = useState<number[][]>(checkWinningConditions(props.matrix));
	const [allowClick, setAllowClick] = useState(true);

	useEffect(() => {
		setMatrix(props.matrix);
		setLastMove(props.lastMove);
	}, [props]);

	useEffect(() => {
		const result = checkWinningConditions(matrix);
		if (result.length > 0) {
			setWinningPositions(result);
			setTimeout(() => {
				document.dispatchEvent(new CustomEvent("finish-game", {detail: {winner: matrix[result[0][0]][result[0][1]]}}));
			}, 1000);
		} else {
			if (matrix.every((line) => line.every((item) => item !== "0"))) {
				setTimeout(() => {
					document.dispatchEvent(new CustomEvent("finish-draw", {detail: {matrix}}));
				}, 1000);
				setAllowClick(false);
			} else if (!allowClick) {
				setTimeout(() => {
					document.dispatchEvent(new CustomEvent("finish-move", {detail: {matrix}}));
				}, 1000);
			}
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [matrix]);

	useEffect(() => {
		if (winningPositions.length > 0) {
			setAllowClick(false);
		}
	}, [winningPositions]);

	function clickBlock(line: number, index: number) {
		if (matrix[line][index] === "0") {
			const currentMove = !lastMove || lastMove !== "X" ? "X" : "O";
			setMatrix((previous) => {
				let newMatrix = JSON.parse(JSON.stringify(previous));
				newMatrix[line][index] = currentMove;

				props.gameUpdater(newMatrix, currentMove);
				return newMatrix;
			});

			setLastMove(currentMove);
			setAllowClick(false);
		}
	}

	function checkWinningConditions(matrix: string[][]): number[][] {
		function checkLineWins(lines: string[][]): number[][] | undefined {
			const result = lines.map((line, index) => {
				if (line.every((item) => item === line[0] && item !== "0")) return line.map((item, itemIndex) => [index, itemIndex]);
				return undefined;
			});

			for (const object of result) {
				if (object !== undefined) return object;
			}
			return undefined;
		}

		function checkDiagonalWins(lines: string[][]): number[][] | undefined {
			const firstDiagonal = lines.map((line, lineIndex) => ({
				value: line.filter((item, index) => index === lineIndex).pop(),
				position: [lineIndex, lineIndex],
			}));
			const secondDiagonal = lines.map((line, lineIndex) => ({
				value: line.filter((item, index) => line.length - index - 1 === lineIndex).pop(),
				position: [lineIndex, line.length - lineIndex - 1],
			}));

			if (firstDiagonal.every(({value}) => value === firstDiagonal[0].value && value !== "0"))
				return firstDiagonal.map((item) => item.position);
			if (secondDiagonal.every(({value}) => value === secondDiagonal[0].value && value !== "0"))
				return secondDiagonal.map((item) => item.position);
			return undefined;
		}

		const lineWins = checkLineWins(matrix);
		const columnWins = checkLineWins(transposeMatrix(matrix));
		const diagonalWins = checkDiagonalWins(matrix);

		if (lineWins) return lineWins;
		if (columnWins) return columnWins.map((item) => [item[1], item[0]]);
		if (diagonalWins) return diagonalWins;

		return [];
	}

	return (
		<div className="flex flex-col justify-center items-center  text-white">
			{lastMove && (
				<div className="flex flex-col text-center absolute top-6 text-xl font-medium">
					<span>Last Move:</span>
					<span>{lastMove}</span>
				</div>
			)}
			{matrix.map((line, lineIndex) => (
				<div key={`line_${lineIndex}`} className="flex justify-center items-center border-b-2 border-white last:border-b-0">
					{line.map((item, index) => (
						<div
							onClick={() => {
								if (allowClick) clickBlock(lineIndex, index);
							}}
							key={`${lineIndex}_${index}`}
							className={`${
								winningPositions.map((item) => `${item[0]}_${item[1]}`).includes(`${lineIndex}_${index}`) ? "bg-green-300" : ""
							} border-r-2 border-white text-3xl font-semibold p-8 w-12 h-12 flex items-center justify-center last:border-r-0 cursor-pointer`}>
							{item === "0" ? "" : item}
						</div>
					))}
				</div>
			))}
		</div>
	);
}
