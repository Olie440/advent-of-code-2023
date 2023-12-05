const input = await Bun.file("input.txt").text();

const cardPile = input.split("\n").map(parseCard);

cardPile.forEach(updateWinningCardsCount);

const output = cardPile.reduce(
  (total, currentCard) => total + currentCard.copies,
  0
);

console.log(output);

interface Card {
  copies: number;
  winningNumbersCount: number;
}

function parseCard(line: string): Card {
  const [winningNumbersText, cardNumbersText] =
    line.split(":").at(1)?.split("|") ?? [];

  if (winningNumbersText === undefined || cardNumbersText === undefined) {
    throw new Error(`Unable to parse line: ${line}`);
  }

  const cardNumbers = parseNumbers(cardNumbersText);
  const winningNumbers = parseNumbers(winningNumbersText).filter(
    (winningNumber) => cardNumbers.includes(winningNumber)
  );

  return {
    copies: 1,
    winningNumbersCount: winningNumbers.length,
  };
}

function parseNumbers(numbersText: string): number[] {
  return numbersText
    .split(" ")
    .filter((numberString) => numberString.length > 0)
    .map((numberString) => Number.parseInt(numberString));
}

function updateWinningCardsCount(
  currentCard: Card,
  currentPileIndex: number,
  cardPile: Card[]
): void {
  const winningCardsOffset = currentPileIndex + 1;
  const winningCardIndexes = Array.from(
    { length: currentCard.winningNumbersCount },
    (_, i) => winningCardsOffset + i
  );

  for (let index of winningCardIndexes) {
    cardPile[index].copies += currentCard.copies;
  }
}
