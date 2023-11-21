const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const app = express();
const port = 3000;
const dbFilePath = path.join(__dirname, 'tasks.db');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

(async () => {
  const db = await open({
    filename: dbFilePath,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY,
      title TEXT
    );
  `);

  app.get('/', async (req, res) => {
    const tasks = await db.all('SELECT * FROM tasks');
    res.render('index', { tasks });
  });

  app.post('/add-task', async (req, res) => {
    const { title } = req.body;
    if (title) {
      await db.run('INSERT INTO tasks (title) VALUES (?)', [title]);
    }
    res.redirect('/');
  });

  app.get('/delete-task/:id', async (req, res) => {
    const { id } = req.params;
    await db.run('DELETE FROM tasks WHERE id = ?', [id]);
    res.redirect('/');
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
})();
