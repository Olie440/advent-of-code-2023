import { createDraft, finishDraft } from "immer";

type Grid = Row[];
type Row = Tile[];

interface Tile {
  type: TileType;
  count: {
    row: number;
    column: number;
  };
}

interface Galaxy {
  id: string;
  position: Position;
}

interface Position {
  row: number;
  column: number;
}

type GalaxyPair = [Galaxy, Galaxy];

enum TileType {
  Empty = ".",
  Galaxy = "#",
}

function parseGrid(gridText: string): Grid {
  return gridText.split("\n").map(parseRow);
}

function parseRow(rowText: string): Row {
  return rowText.split("").map((tileText) => ({
    type: tileText as TileType,
    count: {
      row: 1,
      column: 1,
    },
  }));
}

function expandEmptySpace(grid: Grid, expandTo: number): Grid {
  const gridDraft = createDraft(grid);

  expandEmptyColumnsInPlace(gridDraft, expandTo);
  expandEmptyRowsInPlace(gridDraft, expandTo);

  return finishDraft(gridDraft);
}

function expandEmptyColumnsInPlace(grid: Grid, expandTo: number): void {
  const columnNumbers = grid[0].map((_, columnNumber) => columnNumber);

  for (let columnNumber of columnNumbers) {
    const column = grid.map((row) => row[columnNumber]);
    const isColumnEmpty = areAllTilesEmpty(column);

    column.forEach((tile) => {
      tile.count.column *= isColumnEmpty ? expandTo : 1;
    });
  }
}

function expandEmptyRowsInPlace(grid: Grid, expandTo: number): void {
  grid.forEach((row) => {
    const isRowEmpty = areAllTilesEmpty(row);

    row.forEach((tile) => {
      tile.count.row *= isRowEmpty ? expandTo : 1;
    });
  });
}

function areAllTilesEmpty(tiles: Tile[]): boolean {
  return !tiles.some((tile) => tile.type !== TileType.Empty);
}

function findGalaxies(row: Row, rowNumber: number): Galaxy[] {
  return row.reduce((galaxies, tile, columnNumber) => {
    if (tile.type !== TileType.Galaxy) {
      return galaxies;
    }

    const newGalaxy: Galaxy = {
      id: `${rowNumber}${columnNumber}`,
      position: {
        row: rowNumber,
        column: columnNumber,
      },
    };

    return galaxies.concat(newGalaxy);
  }, [] as Galaxy[]);
}

function getGalaxyPairs(galaxies: Galaxy[]): GalaxyPair[] {
  let pairs: GalaxyPair[] = [];

  for (let currentIndex = 1; currentIndex < galaxies.length; currentIndex++) {
    const currentGalaxy = galaxies[currentIndex];
    const previousGalaxies = galaxies.slice(0, currentIndex);

    previousGalaxies.forEach((galaxy) => {
      pairs.push([galaxy, currentGalaxy]);
    });
  }

  return pairs;
}

function getDistance([startGalaxy, endGalaxy]: GalaxyPair, grid: Grid): number {
  const horizontalTiles = getHorizontalTilesBetweenPoints(
    startGalaxy.position,
    endGalaxy.position,
    grid
  );

  const horizontalDistance = horizontalTiles
    .map((tile) => tile.count.column)
    .reduce(sumArray, 0);

  const verticalTiles = getVerticalTilesBetweenPoints(
    startGalaxy.position,
    endGalaxy.position,
    grid
  );

  const verticalDistance = verticalTiles
    .map((tile) => tile.count.row)
    .reduce(sumArray, 0);

  return horizontalDistance + verticalDistance;
}

function getHorizontalTilesBetweenPoints(
  startPosition: Position,
  endPosition: Position,
  grid: Grid
): Tile[] {
  const row = grid[startPosition.row];
  const start = startPosition.column;
  const end = endPosition.column;

  return sliceEitherDirection(row, start, end);
}

function getVerticalTilesBetweenPoints(
  startPosition: Position,
  endPosition: Position,
  grid: Grid
): Tile[] {
  const column = grid.map((row) => row[endPosition.column]);
  const start = startPosition.row;
  const end = endPosition.row;

  return sliceEitherDirection(column, start, end);
}

function sliceEitherDirection<T>(array: T[], start: number, end: number): T[] {
  const sliceBackwards = start > end;
  return sliceBackwards ? array.slice(end, start) : array.slice(start, end);
}

function sumArray(total: number, current: number): number {
  return total + current;
}

function getPartOneAnswer(input: string): number {
  const grid = parseGrid(input);
  const expandedGrid = expandEmptySpace(grid, 2);

  const galaxies = expandedGrid.flatMap(findGalaxies);
  const galaxyPairs = getGalaxyPairs(galaxies);

  return galaxyPairs
    .map((galaxyPair) => getDistance(galaxyPair, expandedGrid))
    .reduce(sumArray);
}

function getPartTwoAnswer(input: string): number {
  const grid = parseGrid(input);
  const expandedGrid = expandEmptySpace(grid, 1000000);

  const galaxies = expandedGrid.flatMap(findGalaxies);
  const galaxyPairs = getGalaxyPairs(galaxies);

  return galaxyPairs
    .map((galaxyPair) => getDistance(galaxyPair, expandedGrid))
    .reduce(sumArray);
}

const input = await Bun.file("input.txt").text();

console.log({
  part1: getPartOneAnswer(input),
  part2: getPartTwoAnswer(input),
});
