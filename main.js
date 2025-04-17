let vocabData = [];

const stored = localStorage.getItem("vocabData");
if (stored) {
  try {
    vocabData = JSON.parse(stored);
  } catch (e) {
    console.warn("Dữ liệu localStorage bị lỗi, dùng dữ liệu mặc định.");
    vocabData = [
      ["Pollution", "Ô nhiễm", "Air pollution is a serious problem.", "contamination", "purification"],
      ["Deforestation", "Phá rừng", "Deforestation causes biodiversity loss.", "forest clearance", "afforestation"]
    ];
  }
} else {
  vocabData = [
    ["Pollution", "Ô nhiễm", "Air pollution is a serious problem.", "contamination", "purification"],
    ["Deforestation", "Phá rừng", "Deforestation causes biodiversity loss.", "forest clearance", "afforestation"]
  ];
}

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
      td.innerHTML = cell + (i !== 1 ? ` <button onclick="speak('${cell}')">🔊</button>` : "");
      tr.appendChild(td);
    });

    const deleteTd = document.createElement("td");
    deleteTd.innerHTML = `<button onclick="deleteWord(${index})">🗑</button>`;
    tr.appendChild(deleteTd);

    tbody.appendChild(tr);
  });
}

function toggleTable() {
  const table = document.getElementById("tableContainer");
  table.classList.toggle("hidden");
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
  localStorage.setItem("vocabData", JSON.stringify(vocabData));
  clearInputFields();
  renderTable();
}

function clearInputFields() {
  document.getElementById("new-word").value = "";
  document.getElementById("new-meaning").value = "";
  document.getElementById("new-example").value = "";
  document.getElementById("new-synonym").value = "";
  document.getElementById("new-antonym").value = "";
}

function deleteWord(index) {
  if (confirm("Bạn có chắc muốn xóa từ này không?")) {
    vocabData.splice(index, 1);
    localStorage.setItem("vocabData", JSON.stringify(vocabData));
    renderTable();
  }
}

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  speechSynthesis.speak(utterance);
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

function resetTable() {
  if (confirm("Bạn có chắc muốn làm mới danh sách?")) {
    vocabData = [];
    renderTable();
  }
}

function toggleBulkInput() {
  const box = document.getElementById("bulkInputContainer");
  box.classList.toggle("hidden");
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
      localStorage.setItem("vocabData", JSON.stringify(vocabData));
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
  currentQuizIndex = 0;
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

  if (quizMode === "wordToMeaning") {
    quizWord.innerText = `Từ: ${current[0]}`;
  } else {
    quizWord.innerText = `Nghĩa: ${current[1]}`;
  }

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

  const table = document.getElementById("vocabTable");
  const row = table.rows[currentQuizIndex + 1]; // +1 vì row[0] là <thead>

  // Xoá class cũ nếu có
  row?.classList.remove("correct-row", "wrong-row");

  if (input === correct) {
    result.innerText = "✅ Chính xác!";
    correctAnswers++;
    row?.classList.add("correct-row");
  } else {
    result.innerText = `❌ Sai. Đúng là: ${correct}`;
    row?.classList.add("wrong-row");
  }

  score.innerText = `Đúng: ${correctAnswers}/${vocabData.length}`;

  // Reset màu sau 1.5s và chuyển câu tiếp
  setTimeout(() => {
    row?.classList.remove("correct-row", "wrong-row");
    showNextQuiz();
  }, 1500);
}

function toggleAddWord() {
  document.getElementById("addWordContainer").classList.toggle("hidden");
}

// Khi đổi chế độ quiz → reset lại
window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('input[name="quizMode"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      startQuiz();
    });
  });

  // Lấy từ localStorage nếu có
  const stored = localStorage.getItem("vocabData");
  if (stored) {
    try {
      vocabData = JSON.parse(stored);
    } catch (e) {
      console.error("Dữ liệu vocab bị lỗi JSON.");
    }
  }

  renderTable();
});

function clearStorage() {
  if (confirm("Bạn có chắc muốn xoá toàn bộ dữ liệu đã lưu không?")) {
    localStorage.removeItem("vocabData");
    vocabData = [];
    renderTable();
    alert("Đã xoá toàn bộ dữ liệu từ vựng.");
  }
}

