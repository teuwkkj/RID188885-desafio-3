const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'tasks.json');

function readTasks() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}
function writeTasks(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

app.get('/tasks', (req, res) => {
  const tasks = readTasks();
  res.json(tasks);
});

app.post('/tasks', (req, res) => {
  const tasks = readTasks();
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'text is required' });
  const item = { id: uid(), text: text.trim(), completed: false, createdAt: Date.now() };
  tasks.push(item);
  writeTasks(tasks);
  res.status(201).json(item);
});

app.put('/tasks/:id', (req, res) => {
  const tasks = readTasks();
  const id = req.params.id;
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  const updated = { ...tasks[idx], ...req.body };
  tasks[idx] = updated;
  writeTasks(tasks);
  res.json(updated);
});

app.delete('/tasks/:id', (req, res) => {
  let tasks = readTasks();
  const id = req.params.id;
  const before = tasks.length;
  tasks = tasks.filter(t => t.id !== id);
  if (tasks.length === before) return res.status(404).json({ error: 'not found' });
  writeTasks(tasks);
  res.json({ success: true });
});

app.delete('/tasks', (req, res) => {
  let tasks = readTasks();
  const keep = tasks.filter(t => !t.completed);
  writeTasks(keep);
  res.json({ success: true, remaining: keep.length });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  if (!fs.existsSync(DATA_FILE)) writeTasks([]);
  console.log(`Task API running on http://localhost:${PORT}`);
});
