const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.TODO_PORT || 3001;
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'todos.db');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH);

app.use(express.json());

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Initialize DB
const initSql = `
CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;

db.serialize(() => {
  db.run(initSql);
  // Seed if empty
  db.get('SELECT COUNT(*) AS count FROM todos', (err, row) => {
    if (err) return;
    if (row.count === 0) {
      const now = new Date().toISOString();
      const stmt = db.prepare('INSERT INTO todos (content, completed, created_at, updated_at) VALUES (?, ?, ?, ?)');
      stmt.run('学习 Three.js 3D 渲染', 1, now, now);
      stmt.run('开发 Todo List 应用', 1, now, now);
      stmt.run('将项目推送到 GitHub', 0, now, now);
      stmt.finalize();
    }
  });
});

// Helpers
const mapTodo = (row) => ({
  id: row.id,
  content: row.content,
  completed: !!row.completed,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

// List todos
app.get('/api/todos', (req, res) => {
  const filter = req.query.filter || 'all';
  let where = '';
  if (filter === 'active') where = 'WHERE completed = 0';
  if (filter === 'completed') where = 'WHERE completed = 1';

  db.all(`SELECT * FROM todos ${where} ORDER BY id DESC`, (err, rows) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    res.json(rows.map(mapTodo));
  });
});

// Create todo
app.post('/api/todos', (req, res) => {
  const content = (req.body.content || '').trim();
  if (!content) return res.status(400).json({ error: 'content_required' });

  const now = new Date().toISOString();
  const sql = 'INSERT INTO todos (content, completed, created_at, updated_at) VALUES (?, 0, ?, ?)';
  db.run(sql, [content, now, now], function (err) {
    if (err) return res.status(500).json({ error: 'db_error' });
    db.get('SELECT * FROM todos WHERE id = ?', [this.lastID], (e, row) => {
      if (e) return res.status(500).json({ error: 'db_error' });
      res.json(mapTodo(row));
    });
  });
});

// Update todo
app.put('/api/todos/:id', (req, res) => {
  const id = req.params.id;
  const content = typeof req.body.content === 'string' ? req.body.content.trim() : null;
  const completed = typeof req.body.completed === 'boolean' ? (req.body.completed ? 1 : 0) : null;
  const now = new Date().toISOString();

  db.get('SELECT * FROM todos WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    if (!row) return res.status(404).json({ error: 'not_found' });

    const newContent = content !== null ? content : row.content;
    const newCompleted = completed !== null ? completed : row.completed;

    db.run(
      'UPDATE todos SET content = ?, completed = ?, updated_at = ? WHERE id = ?',
      [newContent, newCompleted, now, id],
      (e) => {
        if (e) return res.status(500).json({ error: 'db_error' });
        db.get('SELECT * FROM todos WHERE id = ?', [id], (e2, updated) => {
          if (e2) return res.status(500).json({ error: 'db_error' });
          res.json(mapTodo(updated));
        });
      }
    );
  });
});

// Delete todo
app.delete('/api/todos/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM todos WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    res.json({ ok: true });
  });
});

// Clear completed
app.post('/api/todos/clear-completed', (req, res) => {
  db.run('DELETE FROM todos WHERE completed = 1', (err) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    res.json({ ok: true });
  });
});

// Set all completed/uncompleted
app.post('/api/todos/set-all', (req, res) => {
  const completed = !!req.body.completed ? 1 : 0;
  const now = new Date().toISOString();
  db.run('UPDATE todos SET completed = ?, updated_at = ?', [completed, now], (err) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    res.json({ ok: true });
  });
});

app.listen(PORT, () => {
  console.log(`Todo API listening on http://127.0.0.1:${PORT}`);
});
