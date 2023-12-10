type Grid = Tile[][];

interface Tile {
  position: Position;
  type: TileType;
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
  };
}

function getPipe(grid: Grid): Pipe {
  const pipe = createNewPipe(grid);

  while (!isPipeComplete(pipe)) {
    pipe.push(getNextSegmentInPipe(pipe, grid));
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

  let startingDirection = Direction.North;

  while (true) {
    const nextTile = getNextTile(startingTile, startingDirection, grid);

    if (nextTile.type !== TileType.Empty) {
      break;
    }

    if (startingDirection === Direction.West) {
      throw Error("Starting tile not connected to any pipe segments");
    } else {
      startingDirection++;
    }
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

function getNextSegmentInPipe(pipe: Pipe, grid: Grid): PipeSegment {
  const lastSegment = pipe.at(-1) as PipeSegment;
  const nextDirection = getNextDirection(lastSegment);

  return {
    direction: nextDirection,
    tile: getNextTile(lastSegment.tile, nextDirection, grid),
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

function getNextTile(tile: Tile, direction: Direction, grid: Grid): Tile {
  const { x, y } = tile.position;

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
}

const input = await Bun.file("input.txt").text();
const grid = parseGrid(input);
const pipe = getPipe(grid);
const part1 = (pipe.length - 1) / 2;

console.log({ part1 });
