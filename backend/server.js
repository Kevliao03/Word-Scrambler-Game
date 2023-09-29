// Import necessary modules
const express = require('express'); // For creating the server
const cors = require('cors'); // For enabling Cross-Origin Resource Sharing (CORS)
const csvParser = require('csv-parser'); // For parsing CSV files
const fs = require('fs'); // For file system operations

// Create an Express application
const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON requests

// Initialize an empty array to store words from the CSV file
let words = [];

// Load and parse the CSV file containing English words
const file = 'english-words.csv';
fs.createReadStream(file)
  .pipe(csvParser())
  .on('data', (row) => {
    words.push(row.Word); // Assuming the header in the CSV is 'Word'
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });

// Define a function to scramble a word
function scrambleWord(word) {
  return word.split('').sort(() => 0.5 - Math.random()).join('');
}

// Route to get a random scrambled word
app.get('/word', (req, res) => {
  if (!words.length) return res.status(500).json({ error: 'Words not loaded yet' });

  // Generate a random index to select a word from the loaded word list
  const index = Math.floor(Math.random() * words.length);
  const word = words[index];
  const scrambled = scrambleWord(word);
  res.json({ scrambled, original: word }); // Send the original word as well
});

// Route to validate a user's guess
app.post('/validate', (req, res) => {
  const { original, answer } = req.body; // Receive the original word from the frontend

  if (!original || original !== answer) {
    return res.json({ correct: false });
  }

  res.json({ correct: true });
});

// Define the server's port
const PORT = 3000;

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
