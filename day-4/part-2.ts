const wonCardCopiesCache = new Map<number, Card[]>();

const input = await Bun.file("input.txt").text();

const cardPile = input.split("\n").map(parseCard);

const output = cardPile.flatMap(getWonCardCopiesForCard).length;

console.log(output);

interface Card {
  winningNumbers: number[];
  cardNumbers: number[];
  winningCardNumbers: number[];
}

function parseCard(line: string): Card {
  const [winningNumbersText, cardNumbersText] =
    line.split(":").at(1)?.split("|") ?? [];

  if (winningNumbersText === undefined || cardNumbersText === undefined) {
    throw new Error(`Unable to parse line: ${line}`);
  }

  const winningNumbers = parseNumbers(winningNumbersText);
  const cardNumbers = parseNumbers(cardNumbersText);

  return {
    winningNumbers,
    cardNumbers,
    winningCardNumbers: cardNumbers.filter((cardNumber) =>
      winningNumbers.includes(cardNumber)
    ),
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
  const cachedResult = wonCardCopiesCache.get(cardIndex);

  if (cachedResult) {
    return cachedResult;
  }

  const wonCardsOffset = cardIndex + 1;
  const wonCards = cardPile
    .slice(wonCardsOffset, wonCardsOffset + card.winningCardNumbers.length)
    .flatMap((wonCard, wonCardIndex) =>
      getWonCardCopiesForCard(wonCard, wonCardsOffset + wonCardIndex, cardPile)
    );

  const result = [card, ...wonCards];

  wonCardCopiesCache.set(cardIndex, result);

  return result;
}
