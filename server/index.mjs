import express, { response } from "express";
import bodyParser from "body-parser";

import sqlite3 from "sqlite3";

import multer from "multer";

import cors from "cors"
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 3001;

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

let db;

let databaseOpen = false;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db_path = path.resolve(__dirname, "./db/storage.db");
let img_path = path.resolve(__dirname, "./images");

app.use("/images", express.static(img_path));

db = new sqlite3.Database(db_path, (err) => {
    if (err) {
        console.error(err.message);
    } else {
      // Create memories and pictures table if they don't exist
      db.run('CREATE TABLE IF NOT EXISTS memories(memory_id INTEGER PRIMARY KEY autoincrement, title string not null, content text, location string, date string not null, image_urls text, image_ids text, cover_url string)');
      db.run('CREATE TABLE IF NOT EXISTS pictures(memory_id int, image_url string)');
    }
});

function openDatabase() {
  db = new sqlite3.Database(db_path, (err) => {
    if (err) {
        console.error(err.message);
        return;
    } 

    databaseOpen = true;
  });
}

function clearAllMemories()
{
  if(!databaseOpen)
  {
    openDatabase();
  }

  db.run('DELETE FROM memories')
}

function saveMemory(memory)
{
  if(!databaseOpen)
  {
    openDatabase();
  }

  if(!memory.location)
  {
    memory.location = "Ottawa"
  }

  if(!memory.date)
  {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    const formattedToday = dd + '/' + mm + '/' + yyyy;
    memory.date = formattedToday;
  }

  db.run(`INSERT INTO memories(title, content, location, date, cover_url, image_urls ) VALUES (?,?,?,?,?,?)`, [memory.title, memory.content, memory.location, memory.date, memory.cover_url, memory.image_urls], function(error) {

    if (error) {
      return console.log(error.message);
    }

    console.log(`A row has been inserted with rowid ${this.lastID}`);
  });
}

async function db_fetch_all(query){
  return new Promise(function(resolve,reject){
    if(!databaseOpen)
    {
      openDatabase();
    }

    db.all(query, function(err,rows){
        if(err){return reject(err);}
        resolve(rows);
      });
  });
}

app.post('/create', urlencodedParser, (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  
  const body = Object.keys(req.body)[0];

  const memory = JSON.parse(body);

  saveMemory(memory);

  res.send();
});

app.get('/memories', async (req, res) => {
  const memories = await db_fetch_all("SELECT * FROM memories");
  res.json({memories: memories});
});

var storage_path = path.resolve(__dirname, "./images/");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storage_path)
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
});

const upload = multer({ storage: storage });

app.post('/image', upload.array('files'), function (req, res) {
  console.log("Successfully uploaded images");
});

app.post('/memory/delete', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  
  const body = Object.keys(req.body)[0];

  const memory = JSON.parse(body);

  if(!databaseOpen){
    openDatabase();
  }

  await db.run(`DELETE FROM memories WHERE memory_id=${memory.memory_id};`);

  // Send OK status
  res.send();
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});