/* Seq — step sequencer for cutscenes and timed beats. */
(function () {


  class Seq {
    constructor(steps) {
      this._steps = steps;
      this._idx = 0;
      this._timer = 0;
      this._pred = null;
      this._timeout = 0;
      this.done = false;
      this._cancelled = false;
    }

    cancel() {
      this._cancelled = true;
      this.done = true;
    }

    update(dt) {
      if (this.done || this._cancelled) return;

      while (this._idx < this._steps.length) {
        const step = this._steps[this._idx];

        // ── wait: ms ──────────────────────────────────────────────
        if (step && typeof step === "object" && "wait" in step) {
          this._timer += dt;
          if (this._timer < step.wait) return;
          this._timer = 0;
          this._idx++;
          continue;
        }

        // ── waitFor: predicate ────────────────────────────────────
        if (step && typeof step === "object" && "waitFor" in step) {
          if (step.timeout) {
            this._timer += dt;
            if (this._timer >= step.timeout || step.waitFor()) {
              this._timer = 0;
              this._idx++;
              continue;
            }
            return;
          }
          if (!step.waitFor()) return;
          this._idx++;
          continue;
        }

        // ── function: run immediately ─────────────────────────────
        if (typeof step === "function") {
          step();
          this._idx++;
          continue;
        }

        // ── unknown: skip ─────────────────────────────────────────
        this._idx++;
      }

      this.done = true;
    }
  }
  window.Seq = Seq;
})();
