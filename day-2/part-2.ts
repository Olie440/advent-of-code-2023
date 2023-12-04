interface Game {
  id: number;
  cubeSets: CubeSet[];
}

interface CubeSet {
  red: number;
  green: number;
  blue: number;
}

function parseCubeSet(cubeSetText: string): CubeSet {
  const cubeSet: CubeSet = {
    red: 0,
    green: 0,
    blue: 0,
  };

  for (let cubeValue of cubeSetText.split(", ")) {
    const [quantity, colour] = cubeValue.split(" ");

    if (colour in cubeSet) {
      cubeSet[colour as keyof CubeSet] = Number.parseInt(quantity);
    }
  }

  return cubeSet;
}

function parseGame(gameText: string): Game {
  const gameTextParts = gameText.match(/Game (\d{1,}): (.*)/);
  const idText = gameTextParts?.at(1);
  const cubeSetsText = gameTextParts?.at(2);

  if (idText === undefined || cubeSetsText === undefined) {
    throw new Error(`Invalid Game Format: "${gameText}"`);
  }

  return {
    id: Number.parseInt(idText),
    cubeSets: cubeSetsText.split("; ").map(parseCubeSet),
  };
}

function getMinimumCubeSetForGame(game: Game): CubeSet {
  let minimumCubeSet: CubeSet = {
    red: 0,
    green: 0,
    blue: 0,
  };

  for (let cubeSet of game.cubeSets) {
    minimumCubeSet = {
      red: Math.max(minimumCubeSet.red, cubeSet.red),
      green: Math.max(minimumCubeSet.green, cubeSet.green),
      blue: Math.max(minimumCubeSet.blue, cubeSet.blue),
    };
  }

  return minimumCubeSet;
}

function sumCubePowers(total: number, cubeSet: CubeSet): number {
  const { red, blue, green } = cubeSet;
  return total + red * blue * green;
}

const input = await Bun.file("input.txt").text();

const total = input
  .split("\n")
  .map(parseGame)
  .map(getMinimumCubeSetForGame)
  .reduce(sumCubePowers, 0);

console.log(total);
