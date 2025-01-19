import { cx } from "~/utils/styles";

import type * as GameData from "~/types/gamedata-types";

enum GridCell {
	Operator = "operator",
	Empty = "empty",
	Active = "active",
	NewlyActive = "newly active",
	NewlyEmpty = "newly empty",
}

interface NormalizedRange {
	rows: number;
	cols: number;
	grid: GridCell[][];
}

const normalizeRange = (rangeObject: GameData.Range): NormalizedRange => {
	const rangeGrids = [...rangeObject.grids, { row: 0, col: 0 }];
	// for each of rows and cols,
	// find the minimum value and the maximum value
	// then return max-min to get number of rows/cols
	const rowIndices = rangeGrids.map((cell) => cell.row);
	const colIndices = rangeGrids.map((cell) => cell.col);
	const minRowIndex = Math.min(...rowIndices);
	const maxRowIndex = Math.max(...rowIndices);
	const minColIndex = Math.min(...colIndices);
	const maxColIndex = Math.max(...colIndices);

	// create a 2d-array of size [rows, cols]
	const rows = maxRowIndex - minRowIndex + 1;
	const cols = maxColIndex - minColIndex + 1;
	const grid = Array<GridCell>(rows)
		.fill(GridCell.Empty)
		.map(() => Array<GridCell>(cols).fill(GridCell.Empty));
	rangeGrids.forEach((cell) => {
		const type =
			cell.row === 0 && cell.col === 0
				? GridCell.Operator
				: GridCell.Active;
		grid[cell.row - minRowIndex][cell.col - minColIndex] = type;
	});
	return {
		rows,
		cols,
		grid,
	};
};


// operator is always at 0,0
// if tile is in the original range but not in the new range, it's newly empty
// if tile is in the new range but not in the original range, it's newly active

const calculateDifference = (
	originalRangeObject: GameData.Range,
	rangeObject: GameData.Range
): NormalizedRange => {
	const originalGrids = originalRangeObject.grids;
	const grids = rangeObject.grids;

	const activeGrids = grids.filter(
		(cell) =>
			originalGrids.some(
				(originalCell) =>
					originalCell.row === cell.row && originalCell.col === cell.col
			)
	);

	const newlyActiveGrids = grids.filter(
		(cell) =>
			!originalGrids.some(
				(originalCell) =>
					originalCell.row === cell.row && originalCell.col === cell.col
			)
	);

	const newlyEmptyGrids = originalGrids.filter(
		(cell) =>
			!grids.some(
				(newCell) =>
					newCell.row === cell.row && newCell.col === cell.col
			)
	);

	// combine everything into a NormalizedRange
	// calculate the size of both grids combined
	const rowIndices = grids.map((cell) => cell.row);
	const colIndices = grids.map((cell) => cell.col);
	const originalRowIndices = originalGrids.map((cell) => cell.row);
	const originalColIndices = originalGrids.map((cell) => cell.col);

	const minRowIndex = Math.min(
		...rowIndices,
		...originalRowIndices
	);
	const maxRowIndex = Math.max(
		...rowIndices,
		...originalRowIndices
	);
	const minColIndex = Math.min(
		...colIndices,
		...originalColIndices
	);
	const maxColIndex = Math.max(
		...colIndices,
		...originalColIndices
	);

	const rows = maxRowIndex - minRowIndex + 1;
	const cols = maxColIndex - minColIndex + 1;

	const grid = Array<GridCell>(rows)
		.fill(GridCell.Empty)
		.map(() => Array<GridCell>(cols).fill(GridCell.Empty));

	activeGrids.forEach((cell) => {
		grid[cell.row - minRowIndex][cell.col - minColIndex] = GridCell.Active;
	});
	newlyActiveGrids.forEach((cell) => {
		grid[cell.row - minRowIndex][cell.col - minColIndex] = GridCell.NewlyActive;
	});
	newlyEmptyGrids.forEach((cell) => {
		grid[cell.row - minRowIndex][cell.col - minColIndex] = GridCell.NewlyEmpty;
	});

	grid[0 - minRowIndex][0 - minColIndex] = GridCell.Operator;

	console.log(rows);
	console.log(cols);
	return {
		rows,
		cols,
		grid,
	};
}

export interface CharacterRangeProps {
	rangeObject: GameData.Range;
	showDifference?: boolean;
	originalRangeObject?: GameData.Range;
}

// FIXME due to some visually hidden styles the table is slightly too large
// I still need to figure out how to compensate for it
const CharacterRange: React.FC<
	CharacterRangeProps & React.HTMLAttributes<HTMLTableElement>
> = (props) => {
	const { className, rangeObject, ...rest } = props;
	const { showDifference, originalRangeObject } = props;

	if(showDifference && !originalRangeObject) {
		throw new Error("originalRangeObject is required when showDifference is true");
	}
	const { rows, cols, grid } = (showDifference ? calculateDifference(originalRangeObject!, rangeObject) : normalizeRange(rangeObject));

	return (
		// FIXME
		<table
			className={cx("flex-shrink-0 border-separate", className)}
			{...rest}
		>
			<thead>
				<tr>
					<th className="sr-only"></th>
					{[...Array(cols).keys()].map((i) => (
						<th key={i} scope="col" className="sr-only">{`Y${
							i + 1
						}`}</th>
					))}
				</tr>
			</thead>
			<tbody>
				{[...Array(rows).keys()].map((rowIndex) => (
					<tr key={rowIndex} className="items-center">
						<th scope="row" className="sr-only">{`X${
							rowIndex + 1
						}`}</th>
						{[...Array(cols).keys()].map((colIndex) => (
							// FIXME
							<td
								key={colIndex}
								className={cx(
									"box-border h-4 w-4 rounded sm:h-4 sm:w-4", // was formerly sm:h-4 which means everything above small screen size has wider cells.
									// this was probably not what we wanted, so i just made them the same thing
									grid[rowIndex][colIndex] ===
										GridCell.Operator && "bg-neutral-50",
									grid[rowIndex][colIndex] ===
										GridCell.Active &&
										"border-2 border-neutral-200",
									grid[rowIndex][colIndex] ===
										GridCell.NewlyActive &&
										"border-2 border-blue",
									grid[rowIndex][colIndex] ===
										GridCell.NewlyEmpty &&
										"relative border-2 border-red after:absolute after:top-[5px] after:bottom-[5px] after:left-0.5 after:right-0.5 after:bg-red"
								)}
							>
								<span className="sr-only">{`${grid[rowIndex][colIndex]} cell`}</span>
							</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
};
export default CharacterRange;
