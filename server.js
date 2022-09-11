const express = require('express');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3001;

const app = express();

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(express.static('public'));

// GET Route for notes content
app.get('/notes', (req, res) => {
	// console.log(fs.readFile(path.join(__dirname, 'public/notes.html')));
	res.sendFile(path.join(__dirname, 'public/notes.html'))
});

function readFile(filePath) {
  try {
    const data = fs.readFile(filePath, { encoding: 'utf8' });
    return data;
  } catch (err) {
    console.log(err);
  }
}

// GET Route for database notes
app.get('/api/notes', (req, res) => {
	const db = fs.readFileSync(path.join(__dirname, 'db/db.json'), 'utf-8');
	console.log('Called the `api/notes` route.');
	console.log('Notes contents: ', db);
	res.json(JSON.parse(db));
});

// POST Route for database notes
app.post('/api/notes', (req, res) => {
    const db = fs.readFile('./db/db.json');
    res.json(db)
});

// Wildcard route to return main index
// app.get('*', (req, res) =>
//   res.sendFile(path.join(__dirname, 'public/index.html'))
// );

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);
