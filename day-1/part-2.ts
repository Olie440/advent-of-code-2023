const digitStringtoNumberMap: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
};

const digitRegEx = /([0-9]|one|two|three|four|five|six|seven|eight|nine)/;

function extractDigits(line: string): number[] {
  const digits: number[] = [];

  let remainingLine = line;

  while (remainingLine.length > 0) {
    const [match] = remainingLine.match(digitRegEx) ?? [];

    if (match === undefined) {
      break;
    }

    const digit = digitStringtoNumberMap[match] ?? Number.parseInt(match);

    digits.push(digit);

    const matchStart = remainingLine.indexOf(match);
    const cutLength = match.length - 1 || 1;

    remainingLine = remainingLine.slice(matchStart + cutLength);
  }

  return digits;
}

function getLineCalibrationValue(line: string): number {
  const digits = extractDigits(line);

  if (digits.length === 0) {
    throw new Error(`No digits found for line: ${line}`);
  }

  const firstDigit = digits.at(0) as number;
  const lastDigit = digits.at(-1) as number;

  return firstDigit * 10 + lastDigit;
}

function getTotalCalibrationValue(text: string): number {
  return text
    .split("\n")
    .map(getLineCalibrationValue)
    .reduce((total: number, current: number) => total + current, 0);
}

const input = await Bun.file("input.txt").text();

console.log(getTotalCalibrationValue(input));
