import cliProgress, { MultiBar } from "cli-progress";

import {
  Transformation,
  TransformationRule,
  Range,
  WorkerMessage,
  WorkerData,
} from "./part-2-interfaces";

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
    range: {
      start: sourceStart,
      end: sourceStart + size - 1,
    },
  };
}

const SEED_RANGE_REGEX = /\d+ \d+/g;

function parseSeedRanges(seedsLine: string): Range[] {
  const seedsText = seedsLine.split(":").at(1);

  if (seedsText === undefined) {
    throw new Error("Unable to find seed ranges");
  }

  const ranges: Range[] = [];

  for (let match of seedsText.matchAll(SEED_RANGE_REGEX)) {
    ranges.push(parseSeedRange(match[0]));
  }

  return ranges;
}

function parseSeedRange(seedRangeText: string): Range {
  const [start, amount] = seedRangeText
    .split(" ")
    .map((value) => Number.parseInt(value));

  return {
    start,
    end: start + amount - 1,
  };
}

function getMinimumLocationForSeedRange(
  seedRange: Range,
  transformations: Transformation[],
  progressBarsContainer: MultiBar
): Promise<number> {
  return new Promise((resolve) => {
    const seedsInRange = seedRange.end - seedRange.start;
    const progressBar = progressBarsContainer.create(seedsInRange, 0);
    const worker = new Worker("part-2-worker.ts");

    worker.postMessage({
      seedRange,
      transformations,
    } satisfies WorkerData);

    worker.addEventListener("message", (message: WorkerMessage) => {
      if (message.data.type === "progress") {
        progressBar.update(message.data.currentSeed - seedRange.start);
      }

      if (message.data.type === "success") {
        progressBar.update(seedsInRange);
        worker.terminate();
        resolve(message.data.result);
      }
    });
  });
}

function createProgressBars(): MultiBar {
  return new cliProgress.MultiBar(
    {
      clearOnComplete: false,
      hideCursor: true,
      format: "progress [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}",
    },
    cliProgress.Presets.shades_grey
  );
}

const input = await Bun.file("input.txt").text();

const transformations = parseTransformations(input);
const seedsLine = input.split("\n").at(0) ?? "";
const seedRanges = parseSeedRanges(seedsLine);

const progressBarContainer = createProgressBars();
const workerPromises = seedRanges.map((seedRange) =>
  getMinimumLocationForSeedRange(
    seedRange,
    transformations,
    progressBarContainer
  )
);

const results = await Promise.all(workerPromises);

progressBarContainer.stop();

const output = results.reduce((currentMinimum, minimumForSeedRange) => {
  return Math.min(currentMinimum, minimumForSeedRange);
}, Infinity);

console.log(output);
