import { TypedRegEx } from "typed-regex";

interface Map {
  directions: string[];
  nodes: NodeList;
}

interface Node {
  id: string;
  left: string;
  right: string;
}

interface Turn {
  direction: string;
  source: string;
  destination: string;
}

type NodeList = Record<string, Node>;

function parseMap(mapText: string): Map {
  const [directionsText, ...nodesText] = mapText
    .split("\n")
    .filter((line) => line.length);

  return {
    directions: directionsText.split(""),
    nodes: nodesText.map(parseNode).reduce(addNodeToList, {}),
  };
}

const NODE_REGEX = TypedRegEx(
  "(?<id>[0-9A-Z]{3}) = \\((?<left>[0-9A-Z]{3}), (?<right>[0-9A-Z]{3})\\)"
);

function parseNode(nodesText: string): Node {
  const node = NODE_REGEX.captures(nodesText);

  if (node === undefined) {
    throw new Error(`Malformed node: "${nodesText}"`);
  }

  return node;
}

function addNodeToList(nodeList: NodeList, node: Node): NodeList {
  if (node.id in nodeList) {
    throw new Error(`Duplicate node id: ${node.id}`);
  }

  return {
    ...nodeList,
    [node.id]: node,
  };
}

function getTurnsToReachEnd(startID: string, map: Map): number {
  let directionIndex = 0;
  let currentNode = map.nodes[startID];
  let path: Turn[] = [];

  while (!pathEnded(path)) {
    const direction = map.directions[directionIndex];
    const nextNodeID = direction === "R" ? currentNode.right : currentNode.left;
    const nextNode = map.nodes[nextNodeID];

    if (nextNode === undefined) {
      throw new Error(`Invalid Node: ${nextNodeID}`);
    }

    path.push({
      direction,
      source: currentNode.id,
      destination: nextNode.id,
    });

    const isDirectionIndexLast = directionIndex + 1 === map.directions.length;
    directionIndex = isDirectionIndexLast ? 0 : directionIndex + 1;
    currentNode = nextNode;
  }

  return path.length;
}

function pathEnded(path: Turn[]): boolean {
  return path.at(-1)?.destination?.at(-1) === "Z";
}

function gcd(x: number, y: number): number {
  return y ? gcd(y, x % y) : x;
}

function lcm(x: number, y: number): number {
  return (x * y) / gcd(x, y);
}

const input = await Bun.file("input.txt").text();
const map = parseMap(input);

const part1 = getTurnsToReachEnd("AAA", map);

const part2 = Object.values(map.nodes)
  .filter((node) => node.id.at(-1) === "A")
  .map((node) => getTurnsToReachEnd(node.id, map))
  .reduce(lcm);

console.log({
  part1,
  part2,
});
