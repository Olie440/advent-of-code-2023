import { TypedRegEx } from "typed-regex";

type Box = Lens[];

interface Lens {
  label: string;
  focalLength: number;
}

enum Operation {
  Add,
  Remove,
}

interface AddLensInstruction {
  operation: Operation.Add;
  boxIndex: number;
  lens: Lens;
}

interface RemoveLensInstruction {
  operation: Operation.Remove;
  boxIndex: number;
  label: string;
}

type Instruction = AddLensInstruction | RemoveLensInstruction;

function doPartOne(input: string): number {
  return input.split(",").map(getHashValue).reduce(add, 0);
}

function getHashValue(input: string): number {
  let hashValue = 0;

  for (let char of input) {
    hashValue += char.charCodeAt(0);
    hashValue *= 17;
    hashValue = hashValue % 256;
  }

  return hashValue;
}

function add(a: number, b: number): number {
  return a + b;
}

function doPartTwo(input: string): any {
  return applyInstructionsToBoxes(input.split(","))
    .map(getFocusingPowerOfBox)
    .reduce(add, 0);
}

function applyInstructionsToBoxes(instructions: string[]): Box[] {
  const boxes: Box[] = Array.from({ length: 256 }, () => []);

  for (let instruction of instructions.map(parseInstruction)) {
    const { boxIndex, operation } = instruction;

    if (operation === Operation.Add) {
      boxes[boxIndex] = addLensToBox(boxes[boxIndex], instruction.lens);
    } else {
      boxes[boxIndex] = removeLensFromBox(boxes[boxIndex], instruction.label);
    }
  }

  return boxes;
}

const INSTRUCTION_REGEX = TypedRegEx(
  "(?<label>[a-z]*)(?<operation>=|-)(?<focalLength>\\d|$)"
);

function parseInstruction(instructionText: string): Instruction {
  const instructionParts = INSTRUCTION_REGEX.captures(instructionText);

  if (instructionParts === undefined) {
    throw new Error(`Invalid instruction: ${instructionText}`);
  }

  const {
    label,
    operation: operationText,
    focalLength: focalLengthText,
  } = instructionParts;

  const boxIndex = getHashValue(label);
  const operation = operationText === "=" ? Operation.Add : Operation.Remove;

  if (operation === Operation.Remove) {
    return {
      operation,
      boxIndex,
      label,
    };
  }

  return {
    operation,
    boxIndex,
    lens: {
      label,
      focalLength: Number.parseInt(focalLengthText),
    },
  };
}

function addLensToBox(box: Box, newLens: Lens): Box {
  const lensIndex = box.findIndex((lens) => lens.label === newLens.label);

  return lensIndex === -1
    ? box.concat(newLens)
    : box.toSpliced(lensIndex, 1, newLens);
}

function removeLensFromBox(box: Box, label: string): Box {
  return box.filter((lens) => lens.label !== label);
}

function getFocusingPowerOfBox(box: Box, boxIndex: number) {
  const boxNumber = boxIndex + 1;

  return box
    .map((lens, lensIndex) => boxNumber * (lensIndex + 1) * lens.focalLength)
    .reduce(add, 0);
}

const input = await Bun.file("input.txt").text();

console.log({
  part1: doPartOne(input),
  part2: doPartTwo(input),
});
