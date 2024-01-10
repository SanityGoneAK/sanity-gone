import { cx } from "~/utils/styles";

import type * as GameData from "~/types/gamedata-types";

enum GridCell {
	Operator = "operator",
	Empty = "empty",
	Active = "active",
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

export interface CharacterRangeProps {
	rangeObject: GameData.Range;
}

// FIXME due to some visually hidden styles the table is slightly too large
// I still need to figure out how to compensate for it
const CharacterRange: React.FC<
	CharacterRangeProps & React.HTMLAttributes<HTMLTableElement>
> = (props) => {
	const { rangeObject, ...rest } = props;
	const { rows, cols, grid } = normalizeRange(rangeObject);

	return (
		// FIXME
		<table className="flex-shrink-0 border-separate" {...rest}>
			<thead>
				<tr>
					<th></th>
					{[...Array(cols).keys()].map((i) => (
						<th key={i} scope="col" className="sr-only">{`Y${
							i + 1
						}`}</th>
					))}
				</tr>
			</thead>
			<tbody>
				{[...Array(rows).keys()].map((rowIndex) => (
					<tr key={rowIndex}>
						<th scope="row" className="sr-only">{`X${
							rowIndex + 1
						}`}</th>
						{[...Array(cols).keys()].map((colIndex) => (
							// FIXME
							<td
								key={colIndex}
								className={cx(
									"box-border h-4 w-4 rounded-sm sm:h-3 sm:w-3",
									grid[rowIndex][colIndex] ===
										GridCell.Operator && "bg-neutral-50",
									grid[rowIndex][colIndex] ===
										GridCell.Active &&
										"border-2 border-neutral-200"
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
