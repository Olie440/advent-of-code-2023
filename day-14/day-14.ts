type Grid = Tile[][];

enum Tile {
  Empty = ".",
  RoundRock = "O",
  SquareRock = "#",
}

type TileBuffer = Record<Tile, Tile[]>;

function add(a: number, b: number): number {
  return a + b;
}

function* range(start: number, end: number): Iterable<number> {
  for (let current = start; current <= end; current++) {
    yield current;
  }
}

function parseRow(rowText: string): Tile[] {
  return rowText.split("") as Tile[];
}

function switchRowsAndColumns(grid: Grid): Grid {
  const newGrid: Grid = [];

  for (let columnIndex of grid[0].keys()) {
    const newRow: Tile[] = [];

    for (let row of grid.values()) {
      newRow.push(row[columnIndex]);
    }

    newGrid.push(newRow);
  }

  return newGrid;
}

function rotateGrid(grid: Grid, rotationAngle: number): Grid {
  let rotatedGrid = grid;

  for (let _ of range(1, Math.abs(rotationAngle) / 90)) {
    rotatedGrid =
      rotationAngle > 0
        ? rotateGridClockwise(rotatedGrid)
        : rotateGridAntiClockwise(rotatedGrid);
  }

  return rotatedGrid;
}

function rotateGridClockwise(grid: Grid): Grid {
  return switchRowsAndColumns(grid).map((row) => row.toReversed());
}

function rotateGridAntiClockwise(grid: Grid): Grid {
  return switchRowsAndColumns(grid).toReversed();
}

function tiltGrid(grid: Grid): Grid {
  const tiltedColumns = switchRowsAndColumns(grid).map(tiltColumn);
  return switchRowsAndColumns(tiltedColumns);
}

function tiltColumn(column: Tile[]): Tile[] {
  let tiltedColumn: Tile[] = [];
  let tileBuffer = createEmptyTileBuffer();

  const flushTileBuffer = () => {
    tiltedColumn.push(...Object.values(tileBuffer).flat());
    tileBuffer = createEmptyTileBuffer();
  };

  for (let tile of column.values()) {
    tileBuffer[tile].push(tile);

    if (tile === Tile.SquareRock) {
      flushTileBuffer();
    }
  }

  flushTileBuffer();

  return tiltedColumn;
}

function createEmptyTileBuffer(): TileBuffer {
  return {
    [Tile.RoundRock]: [],
    [Tile.Empty]: [],
    [Tile.SquareRock]: [],
  };
}

function getGridLoad(grid: Grid): number {
  return switchRowsAndColumns(grid).map(getColumnLoad).reduce(add, 0);
}

function getColumnLoad(column: Tile[]) {
  return column.toReversed().map(getTileLoad).reduce(add, 0);
}

function getTileLoad(tile: Tile, rowIndex: number): number {
  return tile === Tile.RoundRock ? rowIndex + 1 : 0;
}

function cycleGrid(grid: Grid): Grid {
  let cycledGrid = tiltGrid(grid);

  for (let _ of range(1, 3)) {
    cycledGrid = rotateGrid(cycledGrid, 90);
    cycledGrid = tiltGrid(cycledGrid);
  }

  return rotateGrid(cycledGrid, 90);
}

function doPartTwo(grid: Grid): number {
  let cycledGrid = grid;

  for (let _ of range(1, 1000000000)) {
    cycledGrid = cycleGrid(cycledGrid);
  }

  return getGridLoad(cycledGrid);
}

const input = await Bun.file("input.txt").text();
const grid = input.split("\n").map(parseRow);

const part1 = getGridLoad(tiltGrid(grid));
const part2 = doPartTwo(grid);

console.log({ part1, part2 });
