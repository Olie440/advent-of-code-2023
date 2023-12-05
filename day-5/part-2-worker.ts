import {
  Range,
  Transformation,
  WorkerData,
  WorkerProgressMessage,
  WorkerSuccessMessage,
} from "./part-2-interfaces";

// prevents TS errors
declare var self: Worker;

const PROGRESS_UPDATE_RATE = 10000;

function getMinimumLocationForSeedRange(
  seedRange: Range,
  transformations: Transformation[]
): number {
  let currentMin = Infinity;

  for (let seed = seedRange.start; seed <= seedRange.end; seed++) {
    if (seed % PROGRESS_UPDATE_RATE === 0) {
      postMessage({
        type: "progress",
        currentSeed: seed,
      } satisfies WorkerProgressMessage);
    }

    currentMin = Math.min(
      currentMin,
      getLocationForSeed(seed, transformations)
    );
  }

  return currentMin;
}

function getLocationForSeed(
  seed: number,
  transformations: Transformation[]
): number {
  return transformations.reduce(applyTransformation, seed);
}

function applyTransformation(
  input: number,
  transformation: Transformation
): number {
  const ruleToApply = transformation.rules.find(
    ({ range }) => range.start <= input && range.end >= input
  );

  return ruleToApply ? input + ruleToApply.modifer : input;
}

self.onmessage = (event: MessageEvent<WorkerData>) => {
  const result = getMinimumLocationForSeedRange(
    event.data.seedRange,
    event.data.transformations
  );

  postMessage({
    type: "success",
    result,
  } satisfies WorkerSuccessMessage);
};
