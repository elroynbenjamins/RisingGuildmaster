export type TutorialStep = "welcome" | "recruit_first" | "refresh_board" | "recruit_second" | "complete";

export interface TutorialState {
  active: boolean;
  completed: boolean;
  step: TutorialStep;
  freeRefreshUsed: boolean;
}

export const createTutorialState = (): TutorialState => ({ active: true, completed: false, step: "welcome", freeRefreshUsed: false });
