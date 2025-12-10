// Click Counter script
(() => {
  const countEl = document.getElementById('count');
  const incBtn = document.getElementById('increment');
  const decBtn = document.getElementById('decrement');
  const resetBtn = document.getElementById('reset');
  const stepInput = document.getElementById('step');
  const persistCheckbox = document.getElementById('persist');

  const STORAGE_KEY = 'clickCounterValue_v1';
  const PERSIST_KEY  = 'clickCounterPersist_v1';

  // parse int safely
  const toInt = v => {
    const n = parseInt(String(v || 0).replace(/[^\d-]/g,''), 10);
    return Number.isNaN(n) ? 0 : n;
  };

  // state
  let count = 0;

  // load
  function load() {
    const persist = localStorage.getItem(PERSIST_KEY);
    if (persist === 'false') {
      persistCheckbox.checked = false;
    } else {
      persistCheckbox.checked = true;
    }
    if (persistCheckbox.checked) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) count = toInt(stored);
    }
    render();
  }

  // save
  function save() {
    if (persistCheckbox.checked) {
      localStorage.setItem(STORAGE_KEY, String(count));
      localStorage.setItem(PERSIST_KEY, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(PERSIST_KEY, 'false');
    }
  }

  function render() {
    countEl.textContent = String(count);
  }

  // animate pulse
  function pulse() {
    countEl.classList.add('pulse');
    window.clearTimeout(pulse._t);
    pulse._t = setTimeout(() => countEl.classList.remove('pulse'), 240);
  }

  // update helper
  function update(delta) {
    const step = Math.max(1, toInt(stepInput.value));
    count += delta * step;
    // optional clamp: prevent going below 0 — change if you want negatives
    // if (count < 0) count = 0;
    render();
    pulse();
    save();
  }

  // event handlers
  incBtn.addEventListener('click', () => update(1));
  decBtn.addEventListener('click', () => update(-1));

  // keyboard shortcut: Space/Enter on increment already handled by button,
  // but we also provide keyboard shortcuts: ArrowUp/ArrowDown/R to reset
  window.addEventListener('keydown', (e) => {
    // ignore when focus is on an input (so typing step isn't interrupted)
    const tag = document.activeElement?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea') {
      // allow Enter on inputs
      if (e.key === 'Enter' && document.activeElement === stepInput) {
        // commit step input and blur
        stepInput.blur();
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      update(1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      update(-1);
    } else if (e.key.toLowerCase() === 'r') {
      e.preventDefault();
      resetHandler();
    }
  });

  resetBtn.addEventListener('click', resetHandler);

  function resetHandler() {
    const ok = confirm('Reset the counter to zero?');
    if (!ok) return;
    count = 0;
    render();
    save();
  }

  // persist checkbox
  persistCheckbox.addEventListener('change', () => {
    save();
  });

  // step input: sanitize on blur
  stepInput.addEventListener('blur', () => {
    let n = toInt(stepInput.value);
    if (n <= 0) n = 1;
    stepInput.value = String(n);
  });

  // accessibility: focus ring usability
  document.addEventListener('keyup', (e) => {
    if (e.key === 'Tab') document.body.classList.add('show-focus');
  });

  // initial load
  load();

  // Optional: expose to window for debugging in devtools
  window.clickCounter = {
    get value(){ return count; },
    set value(v){ count = toInt(v); render(); save(); },
    increment(){ update(1); },
    decrement(){ update(-1); },
    reset(){ resetHandler(); }
  };
})();
