const input = await Bun.file("input.txt").text();

const output = input
  .split("\n")
  .map(parseCard)
  .map(getCardValue)
  .reduce((total, cardValue) => total + cardValue, 0);

console.log(output);

interface Card {
  winningNumbers: number[];
  cardNumbers: number[];
}

function parseCard(line: string): Card {
  const [winningNumbers, cardNumbers] = line.split(":").at(1)?.split("|") ?? [];

  if (winningNumbers === undefined || cardNumbers === undefined) {
    throw new Error(`Unable to parse line: ${line}`);
  }

  return {
    winningNumbers: parseNumbers(winningNumbers),
    cardNumbers: parseNumbers(cardNumbers),
  };
}

function parseNumbers(numbersText: string): number[] {
  return numbersText
    .split(" ")
    .filter((numberString) => numberString.length > 0)
    .map((numberString) => Number.parseInt(numberString));
}

function getCardValue(card: Card): number {
  const winningCardNumbers = card.cardNumbers.filter((cardNumber) =>
    card.winningNumbers.includes(cardNumber)
  );

  if (!winningCardNumbers.length) {
    return 0;
  }

  return 2 ** (winningCardNumbers.length - 1);
}
