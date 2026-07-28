export interface ScheduleArgs {
  deployment: string;
  repo: string;
  emailResultsTo?: string;
  skipTests?: string;
}
export declare const scheduleAllDeploySets: (argv: ScheduleArgs) => Promise<void>;
//# sourceMappingURL=scheduleAllDeploySets.d.ts.map
