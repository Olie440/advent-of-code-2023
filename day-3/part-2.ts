const input = await Bun.file("input.txt").text();

const grid = parseGrid(input);
const output = findGears(grid).reduce((total, gear) => total + gear.ratio, 0);

console.log(output);

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

interface Gear {
  rowNumber: number;
  connectedPartNumbers: PartNumber[];
  position: number;
  ratio: number;
}

interface Range {
  start: number;
  end: number;
}

function parseGrid(input: string): Grid {
  return input.split("\n").map(parseRow);
}

function parseRow(input: string, rowNumber: number): Row {
  const partNumberRegex = /(\d+)/g;
  const symbolRegex = /([^a-zA-Z0-9\.])/g;

  const row: Row = {
    partNumbers: [],
    symbols: [],
  };

  for (let match of input.matchAll(partNumberRegex)) {
    const matchValue = match[0];
    const matchIndex = match.index as number;

    row.partNumbers.push({
      rowNumber,
      value: Number.parseInt(matchValue),
      start: matchIndex,
      end: matchIndex + matchValue.length - 1,
    });
  }

  for (let match of input.matchAll(symbolRegex)) {
    row.symbols.push({
      rowNumber,
      value: match[0],
      position: match.index as number,
    });
  }

  return row;
}

function findGears(grid: Grid): Gear[] {
  return grid.flatMap((row) =>
    row.symbols
      .map((symbol) => convertSymbolToGear(symbol, grid))
      .filter(isNotNullish)
  );
}

function isNotNullish<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

function convertSymbolToGear(symbol: Symbol, grid: Grid): Gear | null {
  const { rowNumber, position, value } = symbol;

  if (value !== "*") {
    return null;
  }

  const rowsToSearch = [
    grid[rowNumber - 1],
    grid[rowNumber],
    grid[rowNumber + 1],
  ];

  const connectedPartNumbers = rowsToSearch
    .filter(isNotNullish)
    .flatMap((row) =>
      findPartNumbersInRange(row, {
        start: position - 1,
        end: position + 1,
      })
    );

  if (connectedPartNumbers.length !== 2) {
    return null;
  }

  return {
    rowNumber,
    position,
    connectedPartNumbers,
    ratio: connectedPartNumbers[0].value * connectedPartNumbers[1].value,
  };
}

function findPartNumbersInRange(row: Row, range: Range): PartNumber[] {
  return row.partNumbers.filter(
    (partNumber) =>
      inRange(partNumber.start, range) || inRange(partNumber.end, range)
  );
}

function inRange(number: number, range: Range): boolean {
  return number >= range.start && number <= range.end;
}
