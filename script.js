const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");
const statusEl = document.getElementById("status");
let current = "0";
let expression = "";
let justEvaluated = false;

function render() {
  resultEl.textContent = current;
  expressionEl.textContent = expression;
}
function clearAll() {
  current = "0"; expression = ""; justEvaluated = false;
  statusEl.textContent = "READY"; render();
}
function append(value) {
  if (justEvaluated && /[0-9.]/.test(value)) { current = "0"; expression = ""; }
  justEvaluated = false;
  if (["+", "−", "×", "÷"].includes(value)) {
    if (current === "0" && !expression) return;
    expression += current + " " + value + " ";
    current = "0";
  } else if (value === "%") {
    current = String(Number(current) / 100);
  } else if (value === ".") {
    if (!current.includes(".")) current += ".";
  } else {
    current = current === "0" ? value : current + value;
  }
  statusEl.textContent = "INPUT";
  render();
}
function calculate() {
  if (!expression) return;
  const full = (expression + current).trim();
  const tokens = full.split(/\s+/);
  if (tokens.length < 3 || tokens.length % 2 === 0) return;
  let values = [];
  let ops = [];
  for (let i = 0; i < tokens.length; i++) {
    if (i % 2 === 0) {
      const n = Number(tokens[i]);
      if (!Number.isFinite(n)) return showError();
      values.push(n);
    } else ops.push(tokens[i]);
  }
  // Apply multiplication and division before addition and subtraction.
  for (let i = 0; i < ops.length;) {
    if (ops[i] === "×" || ops[i] === "÷") {
      const a = values[i], b = values[i + 1];
      if (ops[i] === "÷" && b === 0) return showError("Cannot divide by zero");
      values.splice(i, 2, ops[i] === "×" ? a * b : a / b);
      ops.splice(i, 1);
    } else i++;
  }
  let answer = values[0];
  ops.forEach((op, i) => { answer = op === "+" ? answer + values[i + 1] : answer - values[i + 1]; });
  if (!Number.isFinite(answer)) return showError();
  expression = full + " =";
  current = String(Number(answer.toPrecision(12)));
  justEvaluated = true;
  statusEl.textContent = "DONE";
  render();
}
function showError(message = "Invalid expression") {
  current = message; expression = ""; justEvaluated = true;
  statusEl.textContent = "ERROR"; render();
}
function deleteLast() {
  if (justEvaluated) return clearAll();
  current = current.length > 1 ? current.slice(0, -1) : "0";
  render();
}
document.querySelectorAll(".key").forEach(key => key.addEventListener("click", () => {
  const action = key.dataset.action;
  if (action === "clear") clearAll();
  else if (action === "delete") deleteLast();
  else if (action === "equals") calculate();
  else append(key.dataset.value);
}));
document.addEventListener("keydown", event => {
  if (/^[0-9.]$/.test(event.key)) append(event.key);
  else if (event.key === "+") append("+");
  else if (event.key === "-") append("−");
  else if (event.key === "*") append("×");
  else if (event.key === "/") { event.preventDefault(); append("÷"); }
  else if (event.key === "%") append("%");
  else if (event.key === "Enter" || event.key === "=") calculate();
  else if (event.key === "Backspace") deleteLast();
  else if (event.key === "Escape") clearAll();
});
render();