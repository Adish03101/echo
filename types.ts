export enum Category {
  Strategy = 'Strategy',
  Creation = 'Creation',
  Score = 'Score',
}

export interface Node {
  id: string;
  name: string;
  phase: number;
  parentIds: string[];
  categories?: Category[];
}

export interface NewNodeData {
  name: string;
  phase: number;
  parentIds: string[];
  categories?: Category[];
}