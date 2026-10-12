// Elementos
const formulario = document.getElementById('form-tarea');
const inputTarea = document.getElementById('input-tarea');
const inputFechaLimite = document.getElementById('fecha-limite');
const selectCategoria = document.getElementById('categoria-tarea');
const listaTareas = document.getElementById('lista-tareas');
const listaPorVencer = document.getElementById('lista-por-vencer');
const contadorPendientes = document.getElementById('contador-pendientes');
const botonModo = document.getElementById('btn-modo');
const botonesFiltro = document.querySelectorAll('.filtro');

let tareas = [];
let filtroActual = 'todas';
let idEdicion = null;

// Cargar de localStorage
function cargarTareas() {
  const guardadas = localStorage.getItem('tareasApp');
  if(guardadas) tareas = JSON.parse(guardadas);
  renderizar();
}

function guardarTareas() {
  localStorage.setItem('tareasApp', JSON.stringify(tareas));
}

// ¿Próxima a vencer? (≤2 días)
function esProximaVencer(fechaStr) {
  if(!fechaStr) return false;
  const hoy = new Date();
  const fecha = new Date(fechaStr);
  const diff = (fecha - hoy) / (1000*60*60*24);
  return diff >= 0 && diff <= 2;
}

function renderizar() {
  listaTareas.innerHTML = '';
  listaPorVencer.innerHTML = '';

  let pendientes = 0;
  const hoy = new Date();

  let listaMostrar = tareas;
  if(filtroActual === 'pendientes') listaMostrar = tareas.filter(t => !t.completada);
  if(filtroActual === 'completadas') listaMostrar = tareas.filter(t => t.completada);

  listaMostrar.forEach(tarea => {
    const li = document.createElement('li');
    li.className = 'tarea' + (tarea.completada ? ' completada' : '') + (esProximaVencer(tarea.fecha) ? ' proxima-vencer' : '');
    li.innerHTML = `
      <input type="checkbox" ${tarea.completada ? 'checked' : ''}>
      <span class="tarea-texto">${tarea.texto}<br><small>(${tarea.categoria}) ${tarea.fecha||"Sin fecha límite"}</small></span>
      <button class="btn-editar">✏️</button>
      <button class="btn-eliminar">🗑️</button>
    `;

    // Checkbox
    li.querySelector('input').addEventListener('change', ()=>{
      tarea.completada = !tarea.completada;
      guardarTareas(); renderizar();
    });
    // Editar
    li.querySelector('.btn-editar').addEventListener('click', ()=>{
      inputTarea.value = tarea.texto;
      inputFechaLimite.value = tarea.fecha||'';
      selectCategoria.value = tarea.categoria;
      idEdicion = tarea.id;
    });
    // Eliminar
    li.querySelector('.btn-eliminar').addEventListener('click', ()=>{
      li.classList.add('eliminando');
      setTimeout(()=>{
        tareas = tareas.filter(x=>x.id!==tarea.id);
        guardarTareas(); renderizar();
      },600);
    });

    listaTareas.appendChild(li);
  });

  // Lista próximas a vencer (todas, sin filtro)
  const proximas = tareas.filter(t=>!t.completada && esProximaVencer(t.fecha));
  proximas.forEach(tarea=>{
    const li = document.createElement('li');
    li.className = 'tarea proxima-vencer';
    li.innerHTML = <span class="tarea-texto">${tarea.texto}<br><small>(${tarea.categoria}) ${tarea.fecha}</small></span>;
    listaPorVencer.appendChild(li);
  });

  pendientes = tareas.filter(t=>!t.completada).length;
  contadorPendientes.textContent = pendientes;

  if(listaTareas.children.length === 0) listaTareas.innerHTML = '<li class="sin-tareas">No hay tareas para mostrar</li>';
  if(listaPorVencer.children.length === 0) listaPorVencer.innerHTML = '<li class="sin-tareas">No hay tareas próximas a vencer</li>';
}

// Agregar / editar
formulario.addEventListener('submit', e=>{
  e.preventDefault();
  const texto = inputTarea.value.trim();
  const fecha = inputFechaLimite.value;
  const cat = selectCategoria.value;
  if(!texto) return;

  if(idEdicion !== null) {
    const t = tareas.find(x=>x.id===idEdicion);
    t.texto = texto; t.fecha = fecha; t.categoria = cat;
    idEdicion = null;
  } else {
    tareas.push({ id:Date.now(), texto, fecha, categoria:cat, completada:false });
  }
  formulario.reset();
  guardarTareas(); renderizar();
});

// Filtros
botonesFiltro.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    botonesFiltro.forEach(b=>b.classList.remove('activo'));
    btn.classList.add('activo');
    filtroActual = btn.dataset.filtro;
    renderizar();
  });
});

// Modo oscuro
botonModo.addEventListener('click', ()=>{
  document.body.classList.toggle('modo-oscuro');
  if(document.body.classList.contains('modo-oscuro')) botonModo.textContent = "Modo claro";
  else botonModo.textContent = "Modo oscuro";
});

// Iniciar
cargarTareas();
