type Grid = Row[];

interface Row {
  partNumbers: PartNumber[];
  symbols: Symbol[];
}

interface PartNumber {
  value: number;
  rowNumber: number;
  start: number;
  end: number;
}

interface Symbol {
  value: string;
  rowNumber: number;
  position: number;
}

const PART_NUMBER_REGEX = /(\d+)/g;
const SYMBOL_REGEX = /([^a-zA-Z0-9\.])/g;

function parseGrid(input: string): Grid {
  return input.split("\n").map(parseRow);
}

function parseRow(input: string, rowNumber: number): Row {
  const row: Row = {
    partNumbers: [],
    symbols: [],
  };

  for (let match of input.matchAll(PART_NUMBER_REGEX)) {
    const matchValue = match[0];
    const matchIndex = match.index as number;

    row.partNumbers.push({
      rowNumber,
      value: Number.parseInt(matchValue),
      start: matchIndex,
      end: matchIndex + matchValue.length - 1,
    });
  }

  for (let match of input.matchAll(SYMBOL_REGEX)) {
    row.symbols.push({
      rowNumber,
      value: match[0],
      position: match.index as number,
    });
  }

  return row;
}

function findValidPartNumbers(grid: Grid): PartNumber[] {
  return grid.flatMap((row) =>
    row.partNumbers.filter((partNumber) => isValidPartNumber(partNumber, grid))
  );
}

function isValidPartNumber(partNumber: PartNumber, grid: Grid): boolean {
  const { rowNumber, start, end } = partNumber;

  const rowsToSearch = [
    grid[rowNumber - 1],
    grid[rowNumber],
    grid[rowNumber + 1],
  ];

  return rowsToSearch.some((row) =>
    rowHasSymbolInRange(row, start - 1, end + 1)
  );
}

function rowHasSymbolInRange(
  row: Row | undefined,
  start: number,
  end: number
): boolean {
  return (
    row !== undefined &&
    row.symbols.some(
      (symbol) => symbol.position >= start && symbol.position <= end
    )
  );
}

const input = await Bun.file("input.txt").text();

const grid = parseGrid(input);
const partNumbers = findValidPartNumbers(grid);
const output = partNumbers.reduce(
  (total, partNumber) => total + partNumber.value,
  0
);

console.log(output);
