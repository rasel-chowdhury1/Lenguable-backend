export type TWeeklyPayoutRunStatus = "processing" | "completed" | "failed";

export interface IWeeklyPayoutRun {
  weekStart: Date;
  weekEnd: Date;
  status: TWeeklyPayoutRunStatus;
  totalTeachers: number;
  successful: number;
  failed: number;
  startedAt: Date;
  completedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}
