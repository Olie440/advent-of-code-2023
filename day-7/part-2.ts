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
  cards: string[];
  bid: number;
}

interface Card {
  face: string;
  count: number;
}

const CARD_FACE_VALUES: Record<string, number> = {
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
  ["*"]: 1,
};

function replaceJokerWithWildcard(handText: string): string {
  return handText.replaceAll("J", "*");
}

function parseHand(handText: string): Hand {
  const [cardsText, bidText] = handText.split(" ");

  return {
    cards: cardsText.split(""),
    bid: Number.parseInt(bidText),
    type: getHandType(cardsText),
  };
}

function getHandType(cardsText: string): HandType {
  const sortedCards = parseAndSortCards(cardsText);
  const highestCardCount = sortedCards[0].count;

  switch (sortedCards.length) {
    case 1:
      return HandType.FiveOfAKind;

    case 2:
      return highestCardCount === 4 ? HandType.FourOfAKind : HandType.FullHouse;

    case 3:
      return highestCardCount === 3 ? HandType.ThreeOfAKind : HandType.TwoPair;

    case 4:
      return HandType.OnePair;

    default:
      return HandType.HighCard;
  }
}

function parseAndSortCards(cardsText: string): Card[] {
  const sortedCards = cardsText
    .split("")
    .reduce(addCardToCount, [])
    .toSorted(sortByCountAndThenFaceValue);

  const wildCardIndex = sortedCards.findIndex((card) => card.face === "*");

  if (wildCardIndex === -1) {
    return sortedCards;
  }

  const [wildCardEntry] = sortedCards.splice(wildCardIndex, 1);

  if (sortedCards.length === 0) {
    wildCardEntry.face = "A";
    return [wildCardEntry];
  }

  sortedCards[0].count += wildCardEntry.count;

  return sortedCards;
}

function addCardToCount(cards: Card[], cardFace: string): Card[] {
  const updateIndex = cards.findIndex((count) => count.face === cardFace);

  if (updateIndex === -1) {
    return cards.concat({ face: cardFace, count: 1 });
  }

  cards[updateIndex].count += 1;

  return cards;
}

function sortByCountAndThenFaceValue(cardA: Card, cardB: Card): number {
  if (cardA.count === cardB.count) {
    return CARD_FACE_VALUES[cardB.face] - CARD_FACE_VALUES[cardA.face];
  }

  return cardB.count - cardA.count;
}

function sortByTypeThenFaces(a: Hand, b: Hand): number {
  if (a.type !== b.type) {
    return a.type - b.type;
  }

  for (let i = 0; i < 5; i++) {
    const cardAPoints = CARD_FACE_VALUES[a.cards[i]];
    const cardBPoints = CARD_FACE_VALUES[b.cards[i]];

    if (cardAPoints !== cardBPoints) {
      return cardAPoints - cardBPoints;
    }
  }

  return 0;
}

const input = await Bun.file("input.txt").text();

const output = input
  .split("\n")
  .map(replaceJokerWithWildcard)
  .map(parseHand)
  .toSorted(sortByTypeThenFaces)
  .reduce(
    (total, hand, currentIndex) => total + hand.bid * (currentIndex + 1),
    0
  );

console.log(output);
