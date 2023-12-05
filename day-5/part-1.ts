interface Transformation {
  from: string;
  to: string;
  rules: TransformationRule[];
}

interface TransformationRule {
  start: number;
  end: number;
  modifer: number;
}

const TRANSFORMATION_REGEX = /(\w+)-to-(\w+) map:\n((?:\d+ \d+ \d+\n?)+)/g;

function parseTransformations(transformationsText: string): Transformation[] {
  const transformations: Transformation[] = [];

  for (let match of transformationsText.matchAll(TRANSFORMATION_REGEX)) {
    const [_, from, to, rulesText] = match;
    const rules = rulesText.trim().split("\n").map(parseTransformationRule);

    transformations.push({
      from,
      to,
      rules,
    });
  }

  return transformations;
}

function parseTransformationRule(ruleText: string): TransformationRule {
  const [destinationStart, sourceStart, size] = ruleText
    .split(" ")
    .map((numberString) => Number.parseInt(numberString));

  return {
    modifer: destinationStart - sourceStart,
    start: sourceStart,
    end: sourceStart + size - 1,
  };
}

function mapSeedsToLocations(
  seedsLine: string,
  transformations: Transformation[]
): number[] {
  const seedsText = seedsLine.split(":").at(1);

  if (seedsText === undefined) {
    throw new Error("Unable to find seeds value");
  }

  const seeds = seedsText
    .trim()
    .split(" ")
    .map((seedText) => Number.parseInt(seedText));

  return seeds.map((seed) => transformations.reduce(applyTransformation, seed));
}

function applyTransformation(
  input: number,
  transformation: Transformation
): number {
  const ruleToApply = transformation.rules.find(
    (rule) => rule.start <= input && rule.end >= input
  );

  return ruleToApply ? input + ruleToApply.modifer : input;
}

const input = await Bun.file("input.txt").text();

const transformations = parseTransformations(input);
const seedsLine = input.split("\n").at(0) ?? "";

const locations = mapSeedsToLocations(seedsLine, transformations);
const output = locations.reduce(
  (currentMin, currentLocation) => Math.min(currentMin, currentLocation),
  Infinity
);

console.log(output);
