interface Game {
  id: number;
  cubeSets: CubeSet[];
}

interface CubeSet {
  red: number;
  green: number;
  blue: number;
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

function parseCubeSet(cubeSetText: string): CubeSet {
  const cubeSet: CubeSet = {
    red: 0,
    green: 0,
    blue: 0,
  };

  for (let cubeText of cubeSetText.split(", ")) {
    const [quantity, colour] = cubeText.split(" ");

    if (colour in cubeSet) {
      cubeSet[colour as keyof CubeSet] = Number.parseInt(quantity);
    }
  }

  return cubeSet;
}

function isGamePossible(game: Game): boolean {
  return game.cubeSets.every(
    (cubeSet) => cubeSet.blue <= 14 || cubeSet.green <= 13 || cubeSet.red <= 12
  );
}

function sumGameIds(total: number, game: Game): number {
  return total + game.id;
}

const input = await Bun.file("input.txt").text();

const total = input
  .split("\n")
  .map(parseGame)
  .filter(isGamePossible)
  .reduce(sumGameIds, 0);

console.log(total);
