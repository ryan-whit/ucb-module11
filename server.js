const express = require('express');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3001;

const app = express();

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// GET Route for notes content
app.get('/notes', (req, res) => {
	// console.log(fs.readFile(path.join(__dirname, 'public/notes.html')));
	res.sendFile(path.join(__dirname, 'public/notes.html'))
});

// GET Route for database notes
app.get('/api/notes', (req, res) => {
	console.info(`${req.method} request received to get all the notes.`);
	const db = fs.readFileSync(path.join(__dirname, 'db/db.json'), 'utf-8');
	res.json(JSON.parse(db));
});

/**
 *  Function to write data to the JSON file given a destination and some content
 *  @param {string} destination The file you want to write to.
 *  @param {object} content The content you want to write to the file.
 *  @returns {void} Nothing
 */
 const writeToFile = (destination, content) =>
 fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
	 err ? console.error(err) : console.info(`\nData written to ${destination}`)
 );

/**
 *  Function to read data from a given a file and append some content
 *  @param {object} content The content you want to append to the file.
 *  @param {string} file The path to the file you want to save to.
 *  @returns {void} Nothing
 */
const readAndAppend = (content, file) => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const parsedData = JSON.parse(data);
      parsedData.push(content);
      writeToFile(file, parsedData);
    }
  });
};

// POST Route for database notes
app.post('/api/notes', (req, res) => {
	console.info(`${req.method} request received to add a note.`);

	const { title, text } = req.body;

	if (req.body) {
		const newNote = {
			title,
			text,
			// tip_id: uuid(),
		};

		readAndAppend(newNote, './db/db.json');
		// TODO: return the new note?
		res.json(`Note added successfully`);
	} else {
		res.error('Error in adding tip');
	}
});

// Wildcard route to return main index
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, 'public/index.html'))
);

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);
