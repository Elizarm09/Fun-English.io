

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

//-------------------------------
// LISTENING B1+ y B2
//-------------------------------

function leerFrase(texto) {
  const frase = new SpeechSynthesisUtterance(texto);
  frase.lang = "en-US";
  speechSynthesis.speak(frase);
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
// SPEECH RECOGNITION Y SÍNTESIS DE VOZ
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Verificar compatibilidad del navegador con reconocimiento de voz
  if (!("SpeechRecognition" in window) && !("webkitSpeechRecognition" in window)) {
    alert("Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.");
    return;
  }

  document.querySelectorAll(".activity-card").forEach((card) => {
    const data = card.getAttribute("data-dialogos");
    if (!data) return;

    let dialogos;
    try {
      dialogos = JSON.parse(data);
    } catch (e) {
      console.error("Invalid dialogos JSON:", e);
      return;
    }

    if (!Array.isArray(dialogos) || dialogos.length === 0 || !dialogos.every(d => d.pregunta && d.respuesta)) {
      console.error("Los datos de diálogos están incompletos o mal formateados.");
      return;
    }

    let currentIndex = 0;

    const fraseObjetivo = card.querySelector(".fraseObjetivo");
    const resultado = card.querySelector(".resultado");
    const mensajeError = card.querySelector(".mensajeError");
    const retryBtn = card.querySelector(".retryBtn");
    const messageResult = card.querySelector(".message-result");

    const speakBtn = card.querySelector(".speakBtn");
    const repeatBtn = card.querySelector(".repeatPhraseBtn");
    const nextBtn = card.querySelector(".nextBtn");
    const repeatAnswerBtn = card.querySelector(".repeatAnswerBtn");

    if (!fraseObjetivo || !speakBtn) return;

    // Mostrar la primera frase
    fraseObjetivo.textContent = `"${dialogos[currentIndex].pregunta}"`;

    // Eventos
    speakBtn.addEventListener("click", () => startRecognition());
    retryBtn?.addEventListener("click", () => startRecognition());
    nextBtn?.addEventListener("click", siguienteFrase);
    repeatBtn?.addEventListener("click", () => {
      reproducirFrase(dialogos[currentIndex].pregunta);
    });
    repeatAnswerBtn?.addEventListener("click", () => {
      reproducirFrase(dialogos[currentIndex].respuesta);
    });

    // Función principal de reconocimiento
    function startRecognition() {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.start();

      recognition.onresult = function (event) {
        const speech = event.results[0][0].transcript.trim();
        const expected = dialogos[currentIndex].pregunta;

        resultado.textContent = `You said: "${speech}"`;

        if (normalize(speech) === normalize(expected)) {
          mensajeError?.classList.add("hidden");
          retryBtn?.classList.add("hidden");

          messageResult.innerHTML = `✅ Correct!<br><strong>💬 ${dialogos[currentIndex].respuesta}</strong>`;
          messageResult.className = "correct-message message-result";

          repeatAnswerBtn?.classList.remove("hidden"); // Mostrar botón para repetir respuesta
          reproducirFrase(dialogos[currentIndex].respuesta); // Leer la respuesta
        } else {
          mensajeError?.classList.remove("hidden");
          retryBtn?.classList.remove("hidden");
          messageResult.textContent = "";
          repeatAnswerBtn?.classList.add("hidden"); // Ocultar si falla
        }
      };

      recognition.onerror = function (event) {
        resultado.textContent = "🎤 Error: " + event.error;
      };
    }

    // Siguiente frase
    function siguienteFrase() {
      currentIndex = (currentIndex + 1) % dialogos.length;
      fraseObjetivo.textContent = `"${dialogos[currentIndex].pregunta}"`;
      resultado.textContent = "";
      mensajeError?.classList.add("hidden");
      retryBtn?.classList.add("hidden");
      repeatAnswerBtn?.classList.add("hidden");
      messageResult.textContent = "";
    }

    // Reproducción de texto
    function reproducirFrase(texto) {
      speechSynthesis.cancel(); // Detener voz anterior
      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = 'en-US';
      utterance.rate = 0.95;
      speechSynthesis.speak(utterance);
    }

    // Normalizador para comparación de texto
    function normalize(str) {
      return str.toLowerCase()
                .replace(/[^a-z0-9 ]/gi, "")
                .replace(/\s+/g, " ")
                .trim();
    }
  });
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
  const tabContents = document.querySelectorAll('.tab-content, .subtab-content');
  const article = btn.closest('article');
  const paragraphs = article.querySelectorAll('p');
  const text = Array.from(paragraphs).map(p => p.textContent).join(' ');

  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 1;
  utterance.pitch = 1;

  const stopBtn = article.querySelector('.stop-btn');
  stopBtn.style.display = 'inline-block';

  utterance.onend = () => {
    stopBtn.style.display = 'none';
  };

  utterance.onerror = () => {
    stopBtn.style.display = 'none';
  };

  speechSynthesis.speak(utterance);
}


function stopReading(btn) {
  speechSynthesis.cancel();
  btn.style.display = 'none';
}

//---------------------------
//Button next
//--------------------------
function mostrarSiguienteSubtab() {
  // ✅ Reproducir audio motivacional
  const audio = document.getElementById("audio-good-job");
  if (audio) {
    audio.currentTime = 0;
    audio.play();
  }

  const subtabsNav = document.getElementById("subtabs-navigation");
  if (subtabsNav) subtabsNav.style.display = "flex";

  const currentId = subtabOrder[currentSubtabIndex];
  const nextId = subtabOrder[currentSubtabIndex + 1];

  const current = document.getElementById(currentId);
  const next = document.getElementById(nextId);

  if (current) current.style.display = "none";
  if (next) next.style.display = "block";

  document.querySelectorAll(".subtab-button").forEach(btn => btn.classList.remove("active"));

  const nextBtn = Array.from(document.querySelectorAll(".subtab-button")).find(b =>
    b.getAttribute("onclick")?.includes(nextId)
  );
  if (nextBtn) nextBtn.classList.add("active");

  currentSubtabIndex++;
  actualizarBarraProgreso();

  if (currentSubtabIndex >= subtabOrder.length - 1) {
    const nextBtnContainer = document.getElementById("next-section-btn");
    if (nextBtnContainer) nextBtnContainer.style.display = "none";
  }
}


// ------------------------------
// VARIABLES GLOBALES PARA PROGRESO
// ------------------------------
const subtabOrder = Array.from(document.querySelectorAll(".subtab-content"))
  .map(section => section.id)
  .filter(id => id.includes("-")); // evita secciones que no sean de subtabs
let currentSubtabIndex = 0;

// ------------------------------
// FUNCIONES DE NAVEGACIÓN SECUENCIAL CON PROGRESO
// ------------------------------
function mostrarSiguienteSubtab() {
  // ✅ Reproducir audio motivacional
  const audio = document.getElementById("audio-Great-progess");
  if (audio) {
    audio.currentTime = 0;
    audio.play();
  }

  const subtabsNav = document.getElementById("subtabs-navigation");
  if (subtabsNav) subtabsNav.style.display = "flex";

  const currentId = subtabOrder[currentSubtabIndex];
  const nextId = subtabOrder[currentSubtabIndex + 1];

  const current = document.getElementById(currentId);
  const next = document.getElementById(nextId);

  if (current) current.style.display = "none";
  if (next) next.style.display = "block";

  document.querySelectorAll(".subtab-button").forEach(btn => btn.classList.remove("active"));

  const nextBtn = Array.from(document.querySelectorAll(".subtab-button")).find(b =>
    b.getAttribute("onclick")?.includes(nextId)
  );
  if (nextBtn) nextBtn.classList.add("active");

  currentSubtabIndex++;
  actualizarBarraProgreso();

  if (currentSubtabIndex >= subtabOrder.length - 1) {
    const nextBtnContainer = document.getElementById("next-section-btn");
    if (nextBtnContainer) nextBtnContainer.style.display = "none";
  }
}


function iniciarConSoloListening() {
  const subtabs = document.getElementById("subtabs-navigation");
  if (subtabs) subtabs.style.display = "none";

  subtabOrder.forEach((id, index) => {
    const section = document.getElementById(id);
    if (section) section.style.display = index === 0 ? "block" : "none";
  });

  currentSubtabIndex = 0;
  crearBarraProgreso();
  actualizarBarraProgreso();
}

function crearBarraProgreso() {
  if (!document.getElementById("barra-progreso")) {
    const barra = document.createElement("div");
    barra.id = "barra-progreso";
    barra.style.width = "100%";
    barra.style.background = "#ddd";
    barra.style.borderRadius = "6px";
    barra.style.overflow = "hidden";
    barra.style.margin = "20px 0";

    const progreso = document.createElement("div");
    progreso.id = "progreso-interno";
    progreso.style.height = "14px";
    progreso.style.width = "0%";
    progreso.style.background = "#4caf50";
    progreso.style.transition = "width 0.4s ease";

    barra.appendChild(progreso);
    const contenedor = document.getElementById("b1plus-grammar")?.parentNode || document.body;
    contenedor.insertBefore(barra, contenedor.firstChild);
  }
}

function actualizarBarraProgreso() {
  const progreso = document.getElementById("progreso-interno");
  if (progreso) {
    const porcentaje = ((currentSubtabIndex + 1) / subtabOrder.length) * 100;
    progreso.style.width = porcentaje + "%";
  }
}

// Ejecutar al cargar la página
window.addEventListener("DOMContentLoaded", iniciarConSoloListening);





//Answer checking

// ------------------------------
// VARIABLES GLOBALES
// ------------------------------
let totalAciertos = 0;
let totalIntentos = 0;

// ------------------------------
// FUNCIÓN PRINCIPAL PARA CONTEO
// ------------------------------
function checkAnswer(button, isCorrect) {
  const article = button.closest("article");

  // Evita duplicar conteo si ya fue respondido
  if (article.classList.contains("respondido")) return;

  article.classList.add("respondido");
  totalIntentos++;

  if (isCorrect) {
    totalAciertos++;
  }

  handleAnswer(button, isCorrect, "article");

  // Desactivar botones
  const buttons = article.querySelectorAll("button:not(.retry-btn)");
  buttons.forEach(btn => btn.disabled = true);

  // Mostrar botón de reintentar si fue incorrecto
  const retryBtn = article.querySelector(".retry-btn");
  if (retryBtn) retryBtn.style.display = "inline-block";
}

// ------------------------------
// FUNCIÓN PARA MOSTRAR RESULTADO FINAL
// ------------------------------
function mostrarResultadoTotal() {
  const mensaje = `✅ Aciertos: ${totalAciertos}/10.`;

  let resultado = document.getElementById("resultado-final");
  if (!resultado) {
    resultado = document.createElement("p");
    resultado.id = "resultado-final";
    resultado.style.fontWeight = "bold";
    resultado.style.marginTop = "1rem";
    resultado.style.fontSize = "1.1rem";
    resultado.style.color = "#333";
    document.body.appendChild(resultado);
  }

  resultado.textContent = mensaje;
}

// ------------------------------
// REINTENTAR RESPUESTA
// ------------------------------
function resetCard(btn) {
  const article = btn.closest("article");
  const result = article.querySelector(".message-result");
  const retryBtn = article.querySelector(".retry-btn");

  // Verifica si fue respondido y corrige los contadores si fue correcto
  if (article.classList.contains("respondido")) {
    article.classList.remove("respondido");

    const correctBtn = article.querySelector("button.correct");
    if (correctBtn) {
      totalAciertos--;
      totalIntentos--;
    }
  }

  // Restaurar botones
  const buttons = article.querySelectorAll("button:not(.retry-btn)");
  buttons.forEach(btn => {
    btn.disabled = false;
    btn.classList.remove("correct", "incorrect");
  });

  if (result) {
    result.textContent = "";
    result.style.color = "";
  }

  if (retryBtn) retryBtn.style.display = "none";
}

// ------------------------------
// ANSWER CHECKING (VISUAL)
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
