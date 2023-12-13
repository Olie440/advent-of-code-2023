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

function isGridSymmetrical(grid: Grid, expectedDifferences: number): boolean {
  if (grid.length === 0) {
    return false;
  }

  const midpoint = grid.length / 2;
  const leftSide = grid.slice(0, midpoint).toReversed();
  const rightSide = grid.slice(midpoint);
  const differences = differencesBetweenArrays(
    leftSide.flat(),
    rightSide.flat()
  );

  return differences === expectedDifferences;
}

function differencesBetweenArrays<T>(a: T[], b: T[]): number {
  let differences = 0;

  for (let index of a.keys()) {
    if (a[index] !== b[index]) {
      differences++;
    }
  }

  return differences;
}

function findGridMidpoint(grid: Grid, expectedDifferences: number): number {
  for (let index of grid.keys()) {
    const subGridWithMidpoint = sliceGridFromMidpoint(index, grid);

    if (isGridSymmetrical(subGridWithMidpoint, expectedDifferences)) {
      return index;
    }
  }

  return 0;
}

function getGridPoints(grid: Grid, expectedDifferences: number): number {
  const rowsBeforeMidpoint = findGridMidpoint(grid, expectedDifferences);
  const columnsBeforeMidpoint = findGridMidpoint(
    getGridColumns(grid),
    expectedDifferences
  );

  return rowsBeforeMidpoint * 100 + columnsBeforeMidpoint;
}

function getGridColumns(grid: Grid): Grid {
  return grid[0].map((_, column) => grid.map((row) => row[column]));
}

const input = await Bun.file("input.txt").text();

const part1 = input
  .split("\n\n")
  .map(parseGrid)
  .map((grid) => getGridPoints(grid, 0))
  .reduce((total, current) => total + current, 0);

const part2 = input
  .split("\n\n")
  .map(parseGrid)
  .map((grid) => getGridPoints(grid, 1))
  .reduce((total, current) => total + current, 0);

console.log({ part1, part2 });
