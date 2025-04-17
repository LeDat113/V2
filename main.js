let vocabData = [
  ["Pollution", "Ô nhiễm", "Air pollution is a serious problem.", "contamination", "purification"],
  ["Deforestation", "Phá rừng", "Deforestation causes biodiversity loss.", "forest clearance", "afforestation"]
];

let currentQuizIndex = 0;
let quizMode = "wordToMeaning";
let correctAnswers = 0;
let usedQuizIndexes = new Set();

function renderTable() {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  vocabData.forEach((row, index) => {
    const tr = document.createElement("tr");
    row.forEach((cell, i) => {
      const td = document.createElement("td");
      td.className = `col-${["word", "meaning", "example", "synonym", "antonym"][i]}`;
      td.innerHTML = cell + (i !== 1 ? ` <button onclick="speak('${cell}', this)">🔊</button>` : "");
      tr.appendChild(td);
    });

    const deleteTd = document.createElement("td");
    deleteTd.innerHTML = `<button onclick="deleteWord(${index})">🗑</button>`;
    tr.appendChild(deleteTd);

    tbody.appendChild(tr);
  });
}

function toggleTable() {
  document.getElementById("tableContainer").classList.toggle("hidden");
}

function addWord() {
  const word = document.getElementById("new-word").value.trim();
  const meaning = document.getElementById("new-meaning").value.trim();
  const example = document.getElementById("new-example").value.trim();
  const synonym = document.getElementById("new-synonym").value.trim();
  const antonym = document.getElementById("new-antonym").value.trim();

  if (!word || !meaning) {
    alert("Vui lòng điền ít nhất Từ và Nghĩa.");
    return;
  }

  vocabData.push([word, meaning, example, synonym, antonym]);
  clearInputFields();
  renderTable();
}

function clearInputFields() {
  ["new-word", "new-meaning", "new-example", "new-synonym", "new-antonym"]
    .forEach(id => document.getElementById(id).value = "");
}

function deleteWord(index) {
  if (confirm("Bạn có chắc muốn xóa từ này không?")) {
    vocabData.splice(index, 1);
    renderTable();
  }
}

function speak(text, buttonElement) {
  const row = buttonElement.closest("tr");
  row.classList.add("speaking");
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.onend = () => row.classList.remove("speaking");
  speechSynthesis.speak(utterance);
}

function toggleDarkMode() {
  const isDark = document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", isDark);
  document.getElementById("darkModeSwitch").checked = isDark;
}

function resetTable() {
  if (confirm("Bạn có chắc muốn làm mới danh sách?")) {
    vocabData = [];
    renderTable();
  }
}

function toggleBulkInput() {
  document.getElementById("bulkInputContainer").classList.toggle("hidden");
}

function importBulk() {
  const input = document.getElementById("bulkInput").value.trim();
  try {
    let parsed = JSON.parse(input.startsWith("[[") ? input : `[${input}]`);
    let added = 0;

    parsed.forEach(row => {
      if (Array.isArray(row)) {
        if (row.length === 4) {
          const synMatch = row[3].match(/Syn:\s*([^/]+)/i);
          const antMatch = row[3].match(/Ant:\s*(.+)/i);
          const syn = synMatch ? synMatch[1].trim() : "";
          const ant = antMatch ? antMatch[1].trim() : "";
          vocabData.push([row[0], row[1], row[2], syn, ant]);
          added++;
        } else if (row.length === 5) {
          vocabData.push(row);
          added++;
        }
      }
    });

    if (added > 0) {
      document.getElementById("bulkInput").value = "";
      renderTable();
      alert(`Đã thêm ${added} từ.`);
    } else {
      alert("Không có dữ liệu hợp lệ.");
    }
  } catch (e) {
    alert("Lỗi định dạng JSON!");
  }
}

function startQuiz() {
  if (vocabData.length === 0) return;
  quizMode = document.querySelector("input[name='quizMode']:checked").value;
  correctAnswers = 0;
  usedQuizIndexes.clear();
  document.getElementById("quizContainer").classList.remove("hidden");
  showNextQuiz();
}

function showNextQuiz() {
  if (usedQuizIndexes.size >= vocabData.length) {
    alert("Đã hoàn thành toàn bộ từ vựng! Quiz sẽ được làm lại từ đầu.");
    startQuiz();
    return;
  }

  let index;
  do {
    index = Math.floor(Math.random() * vocabData.length);
  } while (usedQuizIndexes.has(index));

  currentQuizIndex = index;
  usedQuizIndexes.add(index);

  const current = vocabData[currentQuizIndex];
  const quizWord = document.getElementById("quizWord");
  const input = document.getElementById("quizInput");
  const result = document.getElementById("quizResult");
  const score = document.getElementById("quizScore");

  quizWord.innerText = quizMode === "wordToMeaning" ? `Từ: ${current[0]}` : `Nghĩa: ${current[1]}`;
  input.value = "";
  input.focus();
  result.innerText = "";
  score.innerText = `Đúng: ${correctAnswers}/${vocabData.length}`;
}

function submitQuiz() {
  const input = document.getElementById("quizInput").value.trim().toLowerCase();
  const current = vocabData[currentQuizIndex];
  const correct = quizMode === "wordToMeaning" ? current[1].toLowerCase() : current[0].toLowerCase();
  const result = document.getElementById("quizResult");
  const score = document.getElementById("quizScore");

  if (input === correct) {
    result.innerText = "✅ Chính xác!";
    correctAnswers++;
  } else {
    result.innerText = `❌ Sai. Đúng là: ${correct}`;
  }

  score.innerText = `Đúng: ${correctAnswers}/${vocabData.length}`;
  setTimeout(showNextQuiz, 1500);
}

window.addEventListener("DOMContentLoaded", () => {
  renderTable();

  document.querySelectorAll('input[name="quizMode"]').forEach((radio) => {
    radio.addEventListener("change", () => startQuiz());
  });

  // Load dark mode trạng thái đã lưu
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
    document.getElementById("darkModeSwitch").checked = true;
  }
});