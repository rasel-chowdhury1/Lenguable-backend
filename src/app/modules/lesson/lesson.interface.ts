export type SpanishLevel = "A0" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface ILesson {
  title: string;
  level: SpanishLevel;
  file: string;
  exercises: string[];
  isLock: boolean;
  order: number;
}
