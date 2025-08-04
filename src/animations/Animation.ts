export interface Animation {
  play(): Promise<void>;
  stateAction: () => void;
  cleanup: () => void;
  init: () => Promise<void>;
}

export interface AnimationParams {
  stateAction: () => void;
  cleanup: () => void;
}

export abstract class BaseAnimation implements Animation {
  public stateAction: () => void;
  public cleanup: () => void;

  constructor({ stateAction, cleanup }: AnimationParams) {
    this.stateAction = stateAction;
    this.cleanup = cleanup;
  }

  abstract play(): Promise<void>;
  abstract init(): Promise<void>;
}

