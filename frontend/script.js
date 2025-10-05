const API = 'http://localhost:3000';

const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const taskCounter = document.getElementById('taskCounter');
const clearCompletedBtn = document.getElementById('clearCompleted');

addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTask(); });
clearCompletedBtn.addEventListener('click', clearCompleted);

async function fetchTasks() {
  const res = await fetch(`${API}/tasks`);
  return res.json();
}

async function render() {
  const tasks = await fetchTasks();
  taskList.innerHTML = '';
  let completed = 0;
  tasks.forEach(t => {
    const li = document.createElement('li');
    if (t.completed) li.classList.add('completed');

    const left = document.createElement('div');
    left.style.display = 'flex';
    left.style.alignItems = 'center';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = t.completed;
    cb.onchange = () => toggleTask(t.id, cb.checked);

    const span = document.createElement('span');
    span.textContent = t.text;

    left.appendChild(cb);
    left.appendChild(span);

    const del = document.createElement('button');
    del.textContent = 'x';
    del.className = 'remove-btn';
    del.onclick = () => deleteTask(t.id);

    li.appendChild(left);
    li.appendChild(del);
    taskList.appendChild(li);

    if (t.completed) completed++;
  });
  taskCounter.textContent = `${completed}/${tasks.length} concluídas`;
}

async function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;
  await fetch(`${API}/tasks`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({text})
  });
  taskInput.value = '';
  render();
}

async function toggleTask(id, completed) {
  await fetch(`${API}/tasks/${id}`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ completed })
  });
  render();
}

async function deleteTask(id) {
  await fetch(`${API}/tasks/${id}`, { method: 'DELETE' });
  render();
}

async function clearCompleted() {
  await fetch(`${API}/tasks`, { method: 'DELETE' });
  render();
}

render();
