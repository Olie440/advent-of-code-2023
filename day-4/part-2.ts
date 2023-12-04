const input = await Bun.file("input.txt").text();

const cardPile = input.split("\n").map(parseCard);

const output = cardPile.flatMap(getWonCardCopiesForCard).length;

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

function getWonCardCopiesForCard(
  card: Card,
  cardIndex: number,
  cardPile: Card[]
): Card[] {
  const winningCardNumbers = card.cardNumbers.filter((cardNumber) =>
    card.winningNumbers.includes(cardNumber)
  );

  const wonCardsOffset = cardIndex + 1;
  const wonCards = cardPile
    .slice(wonCardsOffset, wonCardsOffset + winningCardNumbers.length)
    .flatMap((wonCard, wonCardIndex) =>
      getWonCardCopiesForCard(wonCard, wonCardsOffset + wonCardIndex, cardPile)
    );

  return [card, ...wonCards];
}
