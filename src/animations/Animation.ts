export interface Animation {
  play(): Promise<void>;
  stateAction: () => void;
  cleanup: () => void;
  init: () => Promise<void>;
}

export interface AnimationParams {
  stateAction: () => void;
  cleanup: () => void;
  setup?: () => void;
}

export abstract class BaseAnimation implements Animation {
  public stateAction: () => void;
  public cleanup: () => void;

  constructor({ stateAction, cleanup, setup = () => {} }: AnimationParams) {
    this.stateAction = stateAction;
    this.cleanup = cleanup;
    setup();
  }

  abstract play(): Promise<void>;
  abstract init(): Promise<void>;
}

