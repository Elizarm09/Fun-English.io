// ------------------------------
// TAB MANAGEMENT
// ------------------------------
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const target = button.getAttribute('data-tab');
    if (!target) return;

    tabButtons.forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
      btn.setAttribute('tabindex', '-1');
    });
    tabContents.forEach(content => {
      content.hidden = true;
      content.style.display = 'none';
    });

    button.classList.add('active');
    button.setAttribute('aria-selected', 'true');
    button.setAttribute('tabindex', '0');

    const content = document.getElementById(target);
    if (content) {
      content.hidden = false;
      content.style.display = 'block';
    }
  });
});

// LISTENING
const sharedAudio = new Audio();
document.querySelectorAll('.play-word').forEach(item => {
  item.addEventListener('click', () => {
    sharedAudio.pause();
    sharedAudio.src = item.getAttribute('data-audio');
    sharedAudio.play();
  });
});

function openSubTab(evt, subTabId) {
  const subtabs = document.querySelectorAll('.subtab-content');
  const buttons = document.querySelectorAll('.subtab-button');

  subtabs.forEach(tab => tab.style.display = 'none');
  buttons.forEach(btn => btn.classList.remove('active'));

  const targetSubtab = document.getElementById(subTabId);
  if (targetSubtab) targetSubtab.style.display = 'block';

  if (evt?.currentTarget) {
    evt.currentTarget.classList.add('active');
  }
}

// ------------------------------
// ANSWER CHECKING (COMMON)
// ------------------------------
function handleAnswer(button, isCorrect, articleSelector) {
  const article = button.closest(articleSelector);
  const message = article.querySelector('.message-result');
  const retryBtn = article.querySelector('.retry-btn');
  const buttons = article.querySelectorAll('button:not(.retry-btn)');

  buttons.forEach(btn => btn.disabled = true);

  if (isCorrect) {
    button.classList.add('correct');
    message.textContent = '🎉 Great job!';
    message.classList.remove('error');
    message.classList.add('success');
    retryBtn.style.display = 'none';
  } else {
    button.classList.add('incorrect');
    message.textContent = '❌ Try again.';
    message.classList.remove('success');
    message.classList.add('error');
    retryBtn.style.display = 'inline-block';
  }
}

function checkAnswer(button, isCorrect) {
  handleAnswer(button, isCorrect, 'article');
}

//RETRY BUTTON (GENÉRICO)
//---------------------------------
document.querySelectorAll(".retry-btn").forEach(btn => {
  btn.addEventListener("click", function () {
    const article = btn.closest("article");

    if (!article) return;

    if (article.id === "drag-drop-activity") {
      setupDragWords();
    } else if (article.classList.contains("matching-activity")) {
      resetMatching();
    } else {
      resetCard(btn);
    }

    const msg = article.querySelector(".message-result");
    if (msg) {
      msg.textContent = "";
      msg.classList.remove("success", "error", "correct-message");
    }

    article.querySelectorAll("button").forEach(button => {
      button.disabled = false;
      button.classList.remove("correct", "incorrect");
    });

    btn.style.display = "none";
  });
});

function resetCard(btn) {
  const article = btn.closest("article");
  const message = article.querySelector(".message-result");
  const retryBtn = article.querySelector(".retry-btn");
  const buttons = article.querySelectorAll("button:not(.retry-btn)");

  buttons.forEach(button => {
    button.disabled = false;
    button.classList.remove("correct", "incorrect");
  });

  if (message) {
    message.textContent = '';
    message.classList.remove('error', 'success', 'correct-message');
  }

  if (retryBtn) {
    retryBtn.style.display = 'none';
  }
}
//---------------------------------
//MATCH
//---------------------------------
let selectedLeft = null;
const matches = [];

document.querySelectorAll('.match-item').forEach(item => {
  item.addEventListener('click', () => {
    const isLeft = item.parentElement.classList.contains('left');
    if (isLeft) {
      document.querySelectorAll('.left .match-item').forEach(el => el.classList.remove('selected'));
      item.classList.add('selected');
      selectedLeft = item;
    } else if (selectedLeft) {
      const leftId = selectedLeft.dataset.id;
      const rightId = item.dataset.id;

      // Evitar emparejamientos repetidos
      if (matches.find(m => m.leftId === leftId || m.rightId === rightId)) {
        alert("That item is already matched.");
        selectedLeft.classList.remove('selected');
        selectedLeft = null;
        return;
      }

      drawLineBetween(selectedLeft, item);
      selectedLeft.classList.remove('selected');
      selectedLeft = null;
    }
  });
});

function drawLineBetween(leftEl, rightEl) {
  const svg = document.querySelector('.lines');
  const leftRect = leftEl.getBoundingClientRect();
  const rightRect = rightEl.getBoundingClientRect();
  const containerRect = svg.getBoundingClientRect();

  const startX = leftRect.right - containerRect.left;
  const startY = leftRect.top + leftRect.height / 2 - containerRect.top;
  const endX = rightRect.left - containerRect.left;
  const endY = rightRect.top + rightRect.height / 2 - containerRect.top;

  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", startX);
  line.setAttribute("y1", startY);
  line.setAttribute("x2", endX);
  line.setAttribute("y2", endY);
  line.setAttribute("stroke", "#198754");
  line.setAttribute("stroke-width", "2");

  svg.appendChild(line);

  matches.push({ leftId: leftEl.dataset.id, rightId: rightEl.dataset.id, lineElement: line });
}

function resetMatching() {
  document.querySelectorAll('.match-item').forEach(item => item.classList.remove('selected'));
  selectedLeft = null;
  matches.forEach(m => m.lineElement.remove());
  matches.length = 0;
  const resultEl = document.querySelector('.matching-activity .message-result');
  if (resultEl) {
    resultEl.textContent = '';
    resultEl.classList.remove("success", "error");
  }
}

function checkMatches() {
  const correctMatches = { "1": "d", "2": "c", "3": "a", "4": "b" };

  if (matches.length < Object.keys(correctMatches).length) {
    alert("Make all the matches before checking.");
    return;
  }

  let correctCount = 0;
  for (const m of matches) {
    if (correctMatches[m.leftId] === m.rightId) {
      correctCount++;
      m.lineElement.setAttribute("stroke", "#198754"); // green
    } else {
      m.lineElement.setAttribute("stroke", "#dc3545"); // red
    }
  }

  const resultEl = document.querySelector('.matching-activity .message-result');
  if (!resultEl) return;

  if (correctCount === Object.keys(correctMatches).length) {
    resultEl.textContent = "🎉 Great job! All the matches are correct.";
    resultEl.style.color = "#198754";
    resultEl.classList.add("success");
    resultEl.classList.remove("error");
  } else {
    resultEl.textContent = `❌ You got ${correctCount} out of ${Object.keys(correctMatches).length} correct. Try again.`;
    resultEl.style.color = "#dc3545";
    resultEl.classList.add("error");
    resultEl.classList.remove("success");

    // Mostrar botón de volver a intentar
    const retryBtn = document.querySelector('.matching-activity .retry-btn');
    if (retryBtn) retryBtn.style.display = "inline-block";
  }
}


// ------------------------------
// SPEECH RECOGNITION
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const dialogos = [
    { pregunta: "Excuse me, could you help me?", respuesta: "Of course! What do you need?" },
    { pregunta: "Where is the airport?", respuesta: "It's about 10 minutes from here" },
    { pregunta: "Where can I find a taxi?", respuesta: "There’s a taxi stand at the main square." },
    { pregunta: "How much does it cost?", respuesta: "Around 20 dollars by taxi, less by bus." },
    { pregunta: "Thank you very much!", respuesta: "You’re welcome! Safe travels." }
  ];

  let currentIndex = 0;
  const fraseObjetivo = document.getElementById("fraseObjetivo");
  const resultado = document.getElementById("resultado");
  const mensajeError = document.getElementById("mensajeError");
  const retryBtn = document.getElementById("retryBtn");
  const messageResult = document.querySelector(".message-result");

  document.getElementById("speakBtn").addEventListener("click", startRecognition);
  retryBtn.addEventListener("click", startRecognition);
  document.getElementById("nextBtn").addEventListener("click", siguienteFrase);
  document.getElementById("repeatPhraseBtn").addEventListener("click", () => {
    reproducirFrase(dialogos[currentIndex].pregunta);
  });

  function startRecognition() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.start();

    recognition.onresult = function(event) {
      const speech = event.results[0][0].transcript.trim();
      const expected = dialogos[currentIndex].pregunta;

      resultado.textContent = `You said: "${speech}"`;
      if (normalize(speech) === normalize(expected)) {
        mensajeError.classList.add("hidden");
        retryBtn.classList.add("hidden");
        messageResult.innerHTML = `✅ Correct!<br><strong>💬 ${dialogos[currentIndex].respuesta}</strong>`;
        messageResult.className = "correct-message message-result";
        reproducirFrase(dialogos[currentIndex].respuesta);
      } else {
        mensajeError.classList.remove("hidden");
        retryBtn.classList.remove("hidden");
        messageResult.textContent = "";
      }
    };

    recognition.onerror = function(event) {
      resultado.textContent = "🎤 Error: " + event.error;
    };
  }

  function siguienteFrase() {
    currentIndex = (currentIndex + 1) % dialogos.length;
    fraseObjetivo.textContent = `"${dialogos[currentIndex].pregunta}"`;
    resultado.textContent = "";
    mensajeError.classList.add("hidden");
    retryBtn.classList.add("hidden");
    messageResult.textContent = "";
  }

  function reproducirFrase(texto) {
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    speechSynthesis.speak(utterance);

  }

  function normalize(str) {
    return str.toLowerCase().replace(/[^À-ſa-z0-9 ]/gi, "").replace(/\s+/g, " ").trim();
  }
});

// ------------------------------
// DRAG AND DROP ACTIVITY
// ------------------------------
const correctOrder = ["I", "always", "have", "breakfast", "at", "7:30", "o'clock."];
const words = ["always", "breakfast", "have", "I", "at", "7:30", "o'clock."];

const dragContainer = document.getElementById('dragContainer');
const dragResult = document.querySelector('#drag-drop-activity .message-result');
const retryBtn = document.querySelector('#drag-drop-activity .retry-btn');
const checkBtn = document.getElementById('checkBtn');

function setupDragWords() {
  if (!dragContainer || !dragResult) return;

  dragResult.textContent = '';
  dragResult.classList.remove('success', 'error');
  retryBtn.style.display = 'none';
  dragContainer.innerHTML = '';

  const shuffled = words
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

  shuffled.forEach(word => {
    const span = document.createElement('span');
    span.textContent = word;
    span.setAttribute('draggable', 'true');
    span.className = 'drag-word';

    span.addEventListener('dragstart', dragStart);
    span.addEventListener('dragover', dragOver);
    span.addEventListener('drop', drop);
    span.addEventListener('dragenter', dragEnter);
    span.addEventListener('dragleave', dragLeave);

    dragContainer.appendChild(span);
  });
}

let draggedElement = null;

function dragStart(e) {
  draggedElement = e.target;
  e.dataTransfer.effectAllowed = 'move';
}

function dragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  if (e.target.classList.contains('drag-word')) {
    e.target.classList.add('drag-over');
  }
}

function dragEnter(e) {
  e.preventDefault();
  if (e.target.classList.contains('drag-word')) {
    e.target.classList.add('drag-over');
  }
}

function dragLeave(e) {
  if (e.target.classList.contains('drag-word')) {
    e.target.classList.remove('drag-over');
  }
}

function drop(e) {
  e.preventDefault();
  if (e.target.classList.contains('drag-word') && draggedElement !== e.target) {
    e.target.classList.remove('drag-over');
    const children = Array.from(dragContainer.children);
    const draggedIndex = children.indexOf(draggedElement);
    const targetIndex = children.indexOf(e.target);

    if (draggedIndex < targetIndex) {
      dragContainer.insertBefore(draggedElement, e.target.nextSibling);
    } else {
      dragContainer.insertBefore(draggedElement, e.target);
    }
  }
}

function checkDragOrder() {
  const currentWords = Array.from(dragContainer.children).map(span => span.textContent);
  const isCorrect = currentWords.every((word, i) => word === correctOrder[i]);

  if (isCorrect) {
    dragResult.textContent = "✅ ¡Correct! Well done.";
    dragResult.classList.remove('error');
    dragResult.classList.add('success');
    retryBtn.style.display = 'none';
  } else {
    dragResult.textContent = "❌ Not quite right. Try again!";
    dragResult.classList.remove('success');
    dragResult.classList.add('error');
    retryBtn.style.display = 'inline-block';
  }

  checkBtn.disabled = true;
}


// ------------------------------
// READING COMPREHENSION
// ------------------------------
function checkReadingAnswer(button, isCorrect) {
  handleAnswer(button, isCorrect, 'article');
}

function playReading(src) {
  sharedAudio.pause();
  sharedAudio.src = src;
  sharedAudio.play();
}

// ------------------------------
// WINDOW ONLOAD
// ------------------------------
window.onload = () => {
  if (typeof setupDragWords === 'function') {
    setupDragWords();
  }

  const checkBtn = document.getElementById('checkBtn');
  if (checkBtn) {
    checkBtn.addEventListener('click', checkDragOrder);
  }
};
//-------------------------------
// READING
//-------------------------------

function speakReadingText(btn) {
  const article = btn.closest('article'); 
  const paragraphs = article.querySelectorAll('p');
  const text = Array.from(paragraphs).map(p => p.textContent).join(' ');

  // Detener cualquier síntesis anterior
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 1;
  utterance.pitch = 1;

  speechSynthesis.speak(utterance);
}
function speakReadingText(btn) {
  const article = btn.closest('article');
  const paragraphs = article.querySelectorAll('p');
  const text = Array.from(paragraphs).map(p => p.textContent).join(' ');

  // Detener si ya está hablando
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 1;
  utterance.pitch = 1;

  // Mostrar botón "Stop"
  const stopBtn = article.querySelector('.stop-btn');
  stopBtn.style.display = 'inline-block';

  // Ocultar el botón "Stop" cuando termina
  utterance.onend = () => {
    stopBtn.style.display = 'none';
  };

  // También en caso de error o cancelación
  utterance.onerror = () => {
    stopBtn.style.display = 'none';
  };

  speechSynthesis.speak(utterance);
}

function stopReading(btn) {
  speechSynthesis.cancel();
  btn.style.display = 'none';
}
