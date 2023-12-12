export interface Row {
  springs: string;
  blockSizes: number[];
}

const COUNT_ARRANGEMENTS_CACHE = new Map<string, number>();

function parseInput(input: string): Row[] {
  return input.split("\n").map(parseRow);
}

function parseRow(lineText: string): Row {
  const [springs, sectionsText] = lineText.split(" ");

  return {
    springs,
    blockSizes: sectionsText
      .split(",")
      .map((numberText) => Number.parseInt(numberText)),
  };
}

function unfoldRow(line: Row): Row {
  const unfoldRow = structuredClone(line);

  for (let _ of range(1, 4)) {
    unfoldRow.springs += "?" + line.springs;
    unfoldRow.blockSizes.push(...line.blockSizes);
  }

  return unfoldRow;
}

function* range(start: number, end: number): Generator<number> {
  for (let i = start; i <= end; i++) {
    yield i;
  }
}

function countArrangements(springs: string, blockSizes: number[]): number {
  const cacheKey = springs + blockSizes.join(",");
  const cachedResult = COUNT_ARRANGEMENTS_CACHE.get(cacheKey);

  if (cachedResult !== undefined) {
    return cachedResult;
  }

  if (springs === "") {
    return blockSizes.length === 0 ? 1 : 0;
  }

  if (blockSizes.length === 0) {
    return springs.includes("#") ? 0 : 1;
  }

  const firstSpring = springs.at(0);
  const blockSize = blockSizes[0];
  const blockRegex = new RegExp(`^[#\\?]{${blockSize}}([^#]|$)`);

  let result = 0;

  if (firstSpring !== "#") {
    result += countArrangements(springs.slice(1), blockSizes);
  }

  if (blockRegex.test(springs)) {
    const remainingSprings = springs.replace(blockRegex, "");
    const remainingBlockSizes = blockSizes.slice(1);

    result += countArrangements(remainingSprings, remainingBlockSizes);
  }

  COUNT_ARRANGEMENTS_CACHE.set(cacheKey, result);

  return result;
}

const input = await Bun.file("input.txt").text();
const rows = parseInput(input);

const part1 = rows
  .map((line) => countArrangements(line.springs, line.blockSizes))
  .reduce((total, current) => total + current);

const part2 = rows
  .map(unfoldRow)
  .map((line) => countArrangements(line.springs, line.blockSizes))
  .reduce((total, current) => total + current);

console.log({ part1, part2 });
