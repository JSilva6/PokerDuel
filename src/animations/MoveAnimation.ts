import { BaseAnimation, type AnimationParams } from "./Animation";

export interface MoveParams extends AnimationParams {
  cardID: string;
  duration?: number;
  easing?:   string;
}

export class MoveAnimation extends BaseAnimation {
  private params: MoveParams;
  private cardID: string;
  private cloneObj: HTMLElement;
  private cloneRect!: DOMRect;

  constructor(params: MoveParams) {
    super(params);
    this.params = params
    this.cardID = params.cardID
    this.cloneObj = this.buildClone()
  }

  async init(): Promise<void> {
    await new Promise(requestAnimationFrame);
    this.cloneObj = this.buildClone();
  }

  private buildClone(): HTMLElement {
    const sourceEl = this.getCurrentElement();
    const firstRect = this.getRect(sourceEl);
    this.cloneRect = firstRect;
    const clone = sourceEl.cloneNode(true) as HTMLElement;

    Object.assign(clone.style, {
      position: 'fixed',
      top:    `${firstRect.top}px`,
      left:   `${firstRect.left}px`,
      margin: '0',
      pointerEvents: 'none',
      zIndex: '1000',
    });

    return clone
  }

  private getCurrentElement(): HTMLElement {
    const sourceEl = document.querySelector(
        `[data-card-id="${this.cardID}"]`
      ) as HTMLElement | null;

    if(!sourceEl) throw new Error("Target card isnt on field");

    return sourceEl
  }

  private getRect(el: HTMLElement): DOMRect {
    return el.getBoundingClientRect()
  }

  play(): Promise<void> {
    const { duration = 300, easing = 'ease-out' } = this.params;
    return new Promise(resolve => {
      const { cloneObj: clone } = this

      // display clone obj
      document.body.appendChild(clone);
      const targetEl = this.getCurrentElement();
      const finalRect = this.getRect(targetEl);
      const dx = finalRect.left - this.cloneRect.left;
      const dy = finalRect.top  - this.cloneRect.top;
      clone.style.transform = `translate(${dx}px,${dy}px)`;
      clone.style.transition = `transform ${duration}ms ${easing}`;

      // cleanup
      clone.addEventListener('transitionend', () => {
        document.body.removeChild(clone);
        resolve();
      }, { once: true });
    });
  }
}

