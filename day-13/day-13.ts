type Grid = string[][];

function parseGrid(gridText: string): Grid {
  return gridText.split("\n").map((row) => row.split(""));
}

function sliceGridFromMidpoint(midpoint: number, grid: Grid): Grid {
  const sideLength = Math.min(midpoint, grid.length - midpoint);
  const start = midpoint - sideLength;
  const end = midpoint + sideLength;

  return grid.slice(start, end);
}

function isGridSymmetrical(grid: Grid): boolean {
  if (grid.length === 0) {
    return false;
  }

  const midpoint = grid.length / 2;
  const leftSide = grid.slice(0, midpoint).toReversed();
  const rightSide = grid.slice(midpoint);

  return Bun.deepEquals(leftSide, rightSide);
}

function findGridMidpoint(grid: Grid): number {
  for (let midpoint of range(0, grid.length)) {
    const subGridWithMidpoint = sliceGridFromMidpoint(midpoint, grid);

    if (isGridSymmetrical(subGridWithMidpoint)) {
      return midpoint;
    }
  }

  return 0;
}

function* range(start: number, end: number): Generator<number> {
  for (let i = start; i <= end; i++) {
    yield i;
  }
}

function getGridPoints(grid: Grid, gridIndex: number): number {
  const columnsBeforeMidpoint = findGridMidpoint(getGridColumns(grid));
  const rowsBeforeMidpoint = findGridMidpoint(grid);

  return rowsBeforeMidpoint * 100 + columnsBeforeMidpoint;
}

function getGridColumns(grid: Grid): Grid {
  return grid[0].map((_, column) => grid.map((row) => row[column]));
}

const input = await Bun.file("input.txt").text();

const part1 = input
  .split("\n\n")
  .map(parseGrid)
  .map(getGridPoints)
  .reduce((total, current) => total + current, 0);

console.log({ part1 });
