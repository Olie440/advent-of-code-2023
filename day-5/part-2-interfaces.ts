export interface Transformation {
  from: string;
  to: string;
  rules: TransformationRule[];
}

export interface TransformationRule {
  range: Range;
  modifer: number;
}

export interface Range {
  start: number;
  end: number;
}

export interface WorkerData {
  seedRange: Range;
  transformations: Transformation[];
}

export interface WorkerProgressMessage {
  type: "progress";
  currentSeed: number;
}

export interface WorkerSuccessMessage {
  type: "success";
  result: number;
}

export type WorkerMessage = MessageEvent<
  WorkerProgressMessage | WorkerSuccessMessage
>;
