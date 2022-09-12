// Import the required module dependencies
const express = require('express');
const path = require('path');
const fs = require('fs');
const {
	v1: uuidv1
} = require('uuid');

// Use port 3001, or the current environment port
const PORT = process.env.PORT || 3001;

// Initialize the app
const app = express();

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// GET Route for notes content
app.get('/notes', (req, res) => {
	console.info(`${req.method} request received to get the notes HTML content.`);
	// Send the notes file
	res.sendFile(path.join(__dirname, 'public/notes.html'))
});

// GET Route for database notes.
// Return the current contents of the database file in the response as JSON
app.get('/api/notes', (req, res) => {
	console.info(`${req.method} request received to get all the notes.`);
	const db = fs.readFileSync(path.join(__dirname, 'db/db.json'), 'utf-8');
	// The frontend is expecting an array of Objects instead of an Object
	// with keys of uuid and values of an Object with the note contents.
	// Because of this, convert the database contents to an array of Objects
	// prior to assigning the current database file to the response.
	res.json(Object.values(JSON.parse(db)));
});

// GET Route for database notes.
// Return a Note based on the unique ID (useful for debugging in Insomnia).
app.get('/api/notes/:id', (req, res) => {
	console.info(`${req.method} request received to get all the notes.`);
	const db = fs.readFileSync(path.join(__dirname, 'db/db.json'), 'utf-8');
	// The database JSON file contains an Object with uuid:note keys/values pairs.
	// Return the Object based on the unique ID (uuid).
	res.json(JSON.parse(db)[req.params.id]);
});

/**
 *  Function to write data to the JSON file given a destination and some content.
 * 	Content contains the note object information.
 * 	 *** Inspired by (and copied from) the UCB Module 11 contents. ***
 *  @param {string} destination The file you want to write to.
 *  @param {object} content The content you want to write to the file. Contains
 * 		notes content.
 *  @returns {void} Nothing
 */
 const writeToFile = (destination, content) =>
 fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
	 err ? console.error(err) : console.info(`\nData written to ${destination}`)
 );

/**
 *  Function to read data from a given a file and append some content
 * 	 *** Inspired by (and copied from) the UCB Module 11 contents. ***
 *  @param {object} newNote The note you want to append to the file.
 *  @param {string} file The path to the file you want to save to.
 *  @returns {void} Nothing
 */
const readAndAppend = (newNote, file) => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const parsedData = JSON.parse(data);
			// Generate a Unique ID using the `uuid` module, and append to the Object
			// using this uuid in order to simplify removal with the DELETE Route.
			const uid = uuidv1();
			// Duplicate the uuid in the note Object keys to accomodate the frontend
			// interface as provided. This is somewhat sloppy due to duplication of data,
			// but it should remove the need to iterate through the array of objects
			// to determine the appropriate object to remove with the DELETE request.
			newNote.id = uid;
			parsedData[uid] = newNote;
      writeToFile(file, parsedData);
    }
  });
};

// Delete a Note from the current database JSON file and write out
// a new file. Delete the note based on the uuid.
const readAndDelete = (id, file) => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const parsedData = JSON.parse(data);
			delete parsedData[id];
      writeToFile(file, parsedData);
    }
  });
};

// POST Route for database notes
app.post('/api/notes', (req, res) => {
	console.info(`${req.method} request received to add a note.`);

	if (Object.keys(req.body).length) {
		console.log("req.body", req.body);
		// Unpack the object
		const { title, text } = req.body;
		// The unique ID is assigned at write time by the `readAndAppend` function,
		// so it is not assigned here.
		const newNote = {
			title,
			text,
		};

		readAndAppend(newNote, './db/db.json');
		// TODO: return the new note?
		res.json(newNote);
	} else {
		throw new Error('Error in adding note');
	}
});

// DELETE Route for database notes
app.delete('/api/notes/:id', (req, res) => {
	console.info(`${req.method} request received to delete a note.`);

	if (req.params.id !== '') {
		readAndDelete(req.params.id, './db/db.json');
		res.json(`Note deleted successfully`);
	} else {
		throw new Error('Error in deleting note');
	}
});

// Wildcard route to return main HTML content.
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, 'public/index.html'))
);

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);
