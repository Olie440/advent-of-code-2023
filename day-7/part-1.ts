enum HandType {
  FiveOfAKind = 7,
  FourOfAKind = 6,
  FullHouse = 5,
  ThreeOfAKind = 4,
  TwoPair = 3,
  OnePair = 2,
  HighCard = 1,
}

interface Hand {
  type: HandType;
  cards: string;
  bid: number;
}

type CardFace = keyof typeof cardFaceValues;

const cardFaceValues = {
  ["A"]: 14,
  ["K"]: 13,
  ["Q"]: 12,
  ["J"]: 11,
  ["T"]: 10,
  ["9"]: 9,
  ["8"]: 8,
  ["7"]: 7,
  ["6"]: 6,
  ["5"]: 5,
  ["4"]: 4,
  ["3"]: 3,
  ["2"]: 2,
};

type CardCount = [CardFace, number];

function parseHand(handText: string): Hand {
  const [cardsText, bidText] = handText.split(" ");

  return {
    cards: cardsText,
    bid: Number.parseInt(bidText),
    type: getHandType(cardsText),
  };
}

function getHandType(cardsText: string): HandType {
  const cards = parseCards(cardsText);
  const [_, mostFrequentCardCount] = cards[0];

  switch (cards.length) {
    case 1:
      return HandType.FiveOfAKind;

    case 2:
      return mostFrequentCardCount === 4
        ? HandType.FourOfAKind
        : HandType.FullHouse;

    case 3:
      return mostFrequentCardCount === 3
        ? HandType.ThreeOfAKind
        : HandType.TwoPair;

    case 4:
      return HandType.OnePair;

    default:
      return HandType.HighCard;
  }
}

function isJoker([face]: CardCount): boolean {
  return face === "J";
}

function parseCards(cardsText: string): CardCount[] {
  const cardCounts: Partial<Record<CardFace, number>> = {};

  for (let cardFace of cardsText.split("") as CardFace[]) {
    const currentValue = cardCounts[cardFace] ?? 0;
    cardCounts[cardFace] = currentValue + 1;
  }

  const cardCountEntries = Object.entries(cardCounts) as CardCount[];

  return cardCountEntries.toSorted(sortByCountAndThenFaceValue);
}

function sortByCountAndThenFaceValue(
  [cardFaceA, countA]: CardCount,
  [cardFaceB, countB]: CardCount
): number {
  if (countA === countB) {
    return cardFaceValues[cardFaceB] - cardFaceValues[cardFaceA];
  }

  return countB - countA;
}

function sortByRank(a: Hand, b: Hand): number {
  if (a.type !== b.type) {
    return a.type - b.type;
  }

  for (let i = 0; i < 5; i++) {
    const cardAPoints = cardFaceValues[a.cards[i] as CardFace];
    const cardBPoints = cardFaceValues[b.cards[i] as CardFace];

    if (cardAPoints !== cardBPoints) {
      return cardAPoints - cardBPoints;
    }
  }

  return 0;
}

const input = await Bun.file("input.txt").text();

const output = input
  .split("\n")
  .map(parseHand)
  .toSorted(sortByRank)
  .reduce(
    (total, hand, currentIndex) => total + hand.bid * (currentIndex + 1),
    0
  );

console.log(output);
