function getLineCalibrationValue(line: string): number {
  const digits = line
    .split("")
    .map((digit) => Number.parseInt(digit))
    .filter((digit) => !Number.isNaN(digit));

  if (digits.length === 0) {
    throw new Error(`No numbers found for line: ${line}`);
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
