export default function transposeMatrix(grid: any[][]): any[][] {
	const transposedGrid = JSON.parse(JSON.stringify(grid));

	for (var i = 0; i < grid.length; i++) {
		for (var j = 0; j < grid.length; j++) {
			transposedGrid[i][j] = grid[j][i];
		}
	}

	return transposedGrid;
}
