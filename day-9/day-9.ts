function parseRow(rowText: string): number[] {
  return rowText.split(" ").map((numberText) => Number.parseInt(numberText));
}

function getDifferencesTable(row: number[]): number[][] {
  const table = [row];
  let lastRow = row;

  while (!isRowOfZeros(lastRow)) {
    const nextRow = calculateDifferencesForRow(lastRow);
    table.push(nextRow);
    lastRow = nextRow;
  }

  return table;
}

function isRowOfZeros(sequence: number[]) {
  const hasNonZeroValue = sequence.some(
    (sequenceNumber) => sequenceNumber !== 0
  );

  return !hasNonZeroValue;
}

function calculateDifferencesForRow(row: number[]): number[] {
  return row.reduce((result, currentNumber, currentIndex) => {
    const nextNumber = row[currentIndex + 1];

    if (nextNumber === undefined) {
      return result;
    }

    return result.concat(nextNumber - currentNumber);
  }, [] as number[]);
}

function addNextColumnToTable(table: number[][]): number[][] {
  return table
    .reduceRight(calculateNextColumnFromBottom, [])
    .map((value, index) => table[index].concat(value));
}

function calculateNextColumnFromBottom(
  nextColumn: number[],
  currentRow: number[]
): number[] {
  const differenceToNextValue = nextColumn.at(0) ?? 0;
  const lastValueInRow = currentRow.at(-1) ?? 0;
  const nextValue = lastValueInRow + differenceToNextValue;

  return [nextValue, ...nextColumn];
}

function addLastValuesTogether(
  total: number,
  currentSequence: number[]
): number {
  const lastValueInSequence = currentSequence.at(-1) ?? 0;
  return total + lastValueInSequence;
}

function addPreviousColumnToTable(table: number[][]): number[][] {
  return table
    .reduceRight(calculatePreviousColumnFromBottom, [])
    .map((value, index) => [value, ...table[index]]);
}

function calculatePreviousColumnFromBottom(
  previousColumn: number[],
  currentRow: number[]
): number[] {
  const firstValueInRow = currentRow.at(0) ?? 0;
  const differenceToPreviousValue = previousColumn.at(0) ?? 0;
  const previousValue = firstValueInRow - differenceToPreviousValue;

  return [previousValue, ...previousColumn];
}

function addFirstValuesTogether(
  total: number,
  currentSequence: number[]
): number {
  const firstValueInSequence = currentSequence.at(0) ?? 0;
  return total + firstValueInSequence;
}

const input = await Bun.file("input.txt").text();

const differencesTable = input
  .split("\n")
  .map(parseRow)
  .map(getDifferencesTable);

const part1 = differencesTable
  .map(addNextColumnToTable)
  .map((table) => table[0])
  .reduce(addLastValuesTogether, 0);

const part2 = differencesTable
  .map(addPreviousColumnToTable)
  .map((table) => table[0])
  .reduce(addFirstValuesTogether, 0);

console.log({ part1, part2 });
