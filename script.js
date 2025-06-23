const form = document.getElementById("register-form");
const roleSelect = document.getElementById("role");
const studentFields = document.getElementById("student-fields");
const teacherFields = document.getElementById("teacher-fields");
const studentListSection = document.getElementById("student-list-section");
const studentList = document.getElementById("student-list");

let estudiantes = JSON.parse(localStorage.getItem("estudiantes")) || [];

// Mostrar lista si hay estudiantes
mostrarEstudiantes();

// Mostrar campos según rol seleccionado
roleSelect.addEventListener("change", () => {
  const role = roleSelect.value;
  studentFields.classList.toggle("hidden", role !== "estudiante");
  teacherFields.classList.toggle("hidden", role !== "docente");
  eliminarAlertas();
});

// Manejar el formulario
form.addEventListener("submit", (e) => {
  e.preventDefault();
  eliminarAlertas();

  const role = roleSelect.value;
  const name = document.getElementById("name").value.trim();
  const course = document.getElementById("course").value.trim();

  if (!role) return mostrarAlerta("Choose if you are teacher or student please");
  if (!name) return mostrarAlerta("The name is mandatory.");
  if (!course) return mostrarAlerta("The course is mandatory.");

  if (role === "estudiante") {
    const level = document.getElementById("level").value;
    if (!level) return mostrarAlerta("Choose a level!");

    // Guardar estudiante
    const nuevoEstudiante = { nombre: name, curso: course, nivel: level };
    estudiantes.push(nuevoEstudiante);
    localStorage.setItem("estudiantes", JSON.stringify(estudiantes));
    // Redirigir al nivel correspondiente
    window.location.href = nivelARuta(level);
  }

  if (role === "docente") {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username) return mostrarAlerta("The username is mandatory.");
    if (!password) return mostrarAlerta("The password is mandatory.");

    // Usuario docente predefinido
    if (username === "docente" && password === "1234") {
      localStorage.setItem("sesionDocente", "activa");
      mostrarVistaDocente();
    } else {
      mostrarAlerta("The username or the password is wrong");
    }
  }
});

// Mostrar lista de estudiantes
function mostrarEstudiantes() {
  studentList.innerHTML = "";
  if (estudiantes.length === 0) {
    studentList.innerHTML = "<p>There is no students registered yet.</p>";
    return;
  }

  estudiantes.forEach((est, i) => {
    const div = document.createElement("div");
    div.className = "student";
    div.innerHTML = `
      <strong>${i + 1}. ${est.nombre}</strong><br>
      Curso: ${est.curso}<br>
      Nivel: ${est.nivel}
    `;
    studentList.appendChild(div);
  });
}

// Mostrar vista del docente (lista + ocultar formulario)
function mostrarVistaDocente() {
  form.classList.add("hidden");
  studentListSection.classList.remove("hidden");
  mostrarEstudiantes();
}

// Cerrar sesión docente
function cerrarSesionDocente() {
  localStorage.removeItem("sesionDocente");
  location.href = "index.html";
}

// Redirigir según nivel
function nivelARuta(nivel) {
  switch (nivel) {
    case "B1": return "Levels/b1.html";
    case "B1+": return "Levels/b1plus.html";
    case "B2": return "Levels/b2.html";
    default: return "#";
  }
}

// Borrar todos los estudiantes
function borrarEstudiantes() {
  if (confirm("¿You are about to delete all the students. Are you sure you want to continue?")) {
    estudiantes = [];
    localStorage.removeItem("estudiantes");
    mostrarEstudiantes();
  }
}

// Mostrar alertas personalizadas en el DOM
function mostrarAlerta(mensaje) {
  eliminarAlertas();
  const alerta = document.createElement("div");
  alerta.className = "alerta";
  alerta.textContent = mensaje;
  const container = document.querySelector(".container");
  container.insertBefore(alerta, container.firstChild);
  // Desaparecer después de 3.5 segundos
  setTimeout(() => {
    if (alerta.parentNode) alerta.remove();
  }, 3500);
}

// Eliminar alertas existentes para evitar duplicados
function eliminarAlertas() {
  const alertas = document.querySelectorAll(".alerta");
  alertas.forEach(a => a.remove());
}

// Al cargar la página
window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("sesionDocente") === "activa") {
    mostrarVistaDocente();
  }

  // Asociar evento cerrar sesión al botón si existe
  const cerrarBtn = document.getElementById("cerrar-btn");
  if (cerrarBtn) {
    cerrarBtn.addEventListener("click", cerrarSesionDocente);
  }
});
