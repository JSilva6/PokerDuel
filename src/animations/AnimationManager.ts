import type { Animation } from './Animation';

export class AnimationManager {
  private queue: Animation[] = [];
  private running = false;

  /** Enfileira e dispara se não estiver rodando nada */
  async enqueue(anim: Animation) {
    this.queue.push(anim);
    await new Promise(requestAnimationFrame);
    if (!this.running) this.runNext()
  }

  private async runNext() {
    const anim = this.queue.shift();
    if (!anim) { this.running = false; return; }
    this.running = true;

    await anim.init()
    anim.stateAction()
    await new Promise(requestAnimationFrame);

    await anim.play();
    anim.cleanup();
    this.runNext();
  }

  /** Limpa fila pendente */
  clear() {
    this.queue = [];
  }
}

