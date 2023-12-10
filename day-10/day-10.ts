type Grid = Tile[][];

interface Tile {
  position: Position;
  type: TileType;
  flooded: boolean;
}

interface Position {
  x: number;
  y: number;
}

type Pipe = PipeSegment[];

interface PipeSegment {
  direction: Direction;
  tile: Tile;
}

enum TileType {
  NorthSouthPipe = "|",
  EastSouthPipe = "7",
  SouthEastPipe = "L",
  SouthWestPipe = "J",
  WestEastPipe = "-",
  WestSouthPipe = "F",
  Empty = ".",
  Animal = "S",
}

enum Direction {
  North,
  East,
  South,
  West,
}

const ALL_DIRECTIONS = [
  Direction.North,
  Direction.East,
  Direction.South,
  Direction.West,
];

function parseGrid(gridText: string): Grid {
  return gridText.split("\n").map(parseRow);
}

function parseRow(rowText: string, rowNumber: number): Tile[] {
  return rowText
    .split("")
    .map((tileText, columnNumber) =>
      parseTile(tileText, columnNumber, rowNumber)
    );
}

function parseTile(tileText: string, x: number, y: number): Tile {
  return {
    type: tileText as TileType,
    position: { x, y },
    flooded: false,
  };
}

function getPipe(grid: Grid): Pipe {
  const pipe = createNewPipe(grid);

  while (!isPipeComplete(pipe)) {
    const nextSegment = getNextSegmentInPipe(pipe, grid);

    if (nextSegment === null) {
      break;
    }

    pipe.push(nextSegment);
  }

  return pipe;
}

function createNewPipe(grid: Grid): Pipe {
  const startingTile = grid
    .flat()
    .find((tile) => tile.type === TileType.Animal);

  if (startingTile === undefined) {
    throw new Error("Unable to find starting position");
  }

  const startingDirection = ALL_DIRECTIONS.find(
    (direction) =>
      getNextTile(startingTile, direction, grid)?.type !== TileType.Empty
  );

  if (startingDirection === undefined) {
    throw Error("Starting tile not connected to any pipe segments");
  }

  return [
    {
      direction: startingDirection,
      tile: startingTile,
    },
  ];
}

function isPipeComplete(pipe: Pipe) {
  if (pipe.length < 2) {
    return false;
  }

  const lastTileType = pipe.at(-1)?.tile.type;

  return lastTileType === TileType.Empty || lastTileType === TileType.Animal;
}

function getNextSegmentInPipe(pipe: Pipe, grid: Grid): PipeSegment | null {
  const lastSegment = pipe.at(-1) as PipeSegment;
  const nextDirection = getNextDirection(lastSegment);
  const nextTile = getNextTile(lastSegment.tile, nextDirection, grid);

  if (nextTile === undefined) {
    return null;
  }

  return {
    direction: nextDirection,
    tile: nextTile,
  };
}

function getNextDirection(segment: PipeSegment): Direction {
  switch (segment.tile.type) {
    case TileType.EastSouthPipe:
      return segment.direction === Direction.East
        ? Direction.South
        : Direction.West;

    case TileType.SouthEastPipe:
      return segment.direction === Direction.South
        ? Direction.East
        : Direction.North;

    case TileType.SouthWestPipe:
      return segment.direction === Direction.South
        ? Direction.West
        : Direction.North;

    case TileType.WestSouthPipe:
      return segment.direction === Direction.West
        ? Direction.South
        : Direction.East;

    default:
      return segment.direction;
  }
}

function getNextTile(
  tile: Tile,
  direction: Direction,
  grid: Grid
): Tile | undefined {
  const { x, y } = tile.position;

  try {
    switch (direction) {
      case Direction.North:
        return grid[y - 1][x];

      case Direction.East:
        return grid[y][x + 1];

      case Direction.South:
        return grid[y + 1][x];

      case Direction.West:
        return grid[y][x - 1];
    }
  } catch {
    return undefined;
  }
}

function floodGrid(grid: Grid): Tile[] {
  return getAllConnectedTiles(grid[0][0], grid)
    .filter(isNotNullish)
    .flatMap((tile) => recursivelyFloodEmptyTiles(tile, grid));
}

function getAllConnectedTiles(tile: Tile, grid: Grid): (Tile | undefined)[] {
  return ALL_DIRECTIONS.map((direction) => getNextTile(tile, direction, grid));
}

function isNotNullish<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

function recursivelyFloodEmptyTiles(tile: Tile, grid: Grid): Tile[] {
  if (tile.type !== TileType.Empty || tile.flooded) {
    return [];
  }

  tile.flooded = true;

  return getAllConnectedTiles(tile, grid)
    .filter(isNotNullish)
    .flatMap((connectedTile) => recursivelyFloodEmptyTiles(connectedTile, grid))
    .concat(tile);
}

function sortByPosition(a: Tile, b: Tile): number {
  if (a.position.y == b.position.y) {
    return a.position.x - b.position.x;
  }

  return a.position.y - b.position.y;
}

const input = await Bun.file("flood-step-1.txt").text();
const grid = parseGrid(input);
const pipe = getPipe(grid);

const floodedTiles = floodGrid(grid).toSorted(sortByPosition);
const allEmptyTiles = grid
  .flat()
  .filter((tile) => tile.type === TileType.Empty);

const part1 = (pipe.length - 1) / 2;
const part2 = allEmptyTiles.length - floodedTiles.length;

console.log({ part1, part2 });
