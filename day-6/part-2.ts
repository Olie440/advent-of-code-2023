interface BoatRace {
  duration: number;
  distanceToBeat: number;
  winningDistances: number[];
}

const ROW_LABELS_REGEX = /(?:Time|Distance):\s*/;
const GAPS_BETWEEN_DIGITS_REGEX = /[^\S\n]+/g;

function parseBoatRaces(boatRacesText: string): BoatRace[] {
  const [durations, distancesToBeat] = boatRacesText
    .split("\n")
    .map(parseLineNumbers);

  if (durations.length !== distancesToBeat.length) {
    throw new Error(`Duration and distance lengths are not the same`);
  }

  return durations.map((duration, currentIndex) =>
    createBoatRace(duration, distancesToBeat[currentIndex])
  );
}

function parseLineNumbers(lineText: string): number[] {
  return lineText
    .replace(ROW_LABELS_REGEX, "")
    .split(GAPS_BETWEEN_DIGITS_REGEX)
    .map((numberText) => Number.parseInt(numberText));
}

function createBoatRace(duration: number, distanceToBeat: number): BoatRace {
  const winningDistances: number[] = [];

  for (let waitingTime = 1; waitingTime < duration; waitingTime++) {
    const distance = waitingTime * (duration - waitingTime);

    if (distance > distanceToBeat) {
      winningDistances.push(distance);
    }
  }

  return {
    duration,
    distanceToBeat,
    winningDistances,
  };
}

const input = await Bun.file("input.txt").text();
const racesCombinedInput = input.replaceAll(GAPS_BETWEEN_DIGITS_REGEX, "");

const [boatRace] = parseBoatRaces(racesCombinedInput);

console.log(boatRace.winningDistances.length);
