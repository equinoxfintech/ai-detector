const form = document.getElementById("detect-form");
const textInput = document.getElementById("text-input");
const charCount = document.getElementById("char-count");
const submitBtn = document.getElementById("submit-btn");
const resultEl = document.getElementById("result");
const errorEl = document.getElementById("error");
const aiBar = document.getElementById("ai-bar");
const aiScoreEl = document.getElementById("ai-score");
const humanScoreEl = document.getElementById("human-score");
const verdictEl = document.getElementById("verdict");
const modelEl = document.getElementById("model");

const VERDICT_LABELS = {
  likely_ai: "Sehr wahrscheinlich KI-generiert",
  possibly_ai: "Vermutlich KI-generiert",
  uncertain: "Unklar",
  possibly_human: "Vermutlich von einem Menschen geschrieben",
  likely_human: "Sehr wahrscheinlich von einem Menschen geschrieben",
};

function updateCharCount() {
  charCount.textContent = `${textInput.value.length} Zeichen`;
}

textInput.addEventListener("input", updateCharCount);
updateCharCount();

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
  resultEl.hidden = true;
}

function showResult(data) {
  errorEl.hidden = true;
  resultEl.hidden = false;
  aiBar.style.width = `${data.aiScore}%`;
  aiScoreEl.textContent = `${data.aiScore}% KI`;
  humanScoreEl.textContent = `${data.humanScore}% Mensch`;
  verdictEl.textContent = VERDICT_LABELS[data.verdict] ?? data.verdict;
  modelEl.textContent = `Modell: ${data.model}`;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = textInput.value.trim();

  submitBtn.disabled = true;
  submitBtn.textContent = "Analysiere …";

  try {
    const response = await fetch("/api/detect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await response.json();

    if (!response.ok) {
      showError(data.error ?? "Etwas ist schiefgelaufen.");
      return;
    }

    showResult(data);
  } catch (err) {
    showError("Verbindung zum Server fehlgeschlagen.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Analysieren";
  }
});
