import express, { response } from "express";
import bodyParser from "body-parser";

import sqlite3 from "sqlite3";

import multer from "multer";

import cors from "cors"

const app = express();
const port = 3001;

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

let db;

let databaseOpen = false;

app.use(cors());
app.use('/static', express.static('images'));

app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json())



function openDatabase()
{
  db = new sqlite3.Database('./db/memorybook.db', sqlite3.OPEN_READWRITE, (error) => {
    if (error && error.code == "SQLITE_CANTOPEN") {
        createDatabase();
        return;
        } else if (error) {
            console.log(error);
            exit(1);
    }
  });
}

function createDatabase()
{
  console.log("Creating database and tables...")
  db = new sqlite3.Database('./db/memorybook.db', (error) => {
    if (error) {
        console.log(error);
        exit(1);
    }
    // Create memories and pictures table
    db.run('CREATE TABLE memories(memory_id INTEGER PRIMARY KEY autoincrement, title string not null, content text, location string, date string not null, image_urls text, image_ids text, cover_url string)');
    db.run('CREATE TABLE pictures(memory_id int, image_url string)');
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

  db.run(`INSERT INTO memories(title, content, location, date, cover_url) VALUES (?,?,?,?,?)`, [memory.title, memory.content, memory.location, memory.date, memory.cover_url], function(error) {

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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images/')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
});

const upload = multer({ storage: storage });

app.post('/image', upload.single('file'), function (req, res) {
  console.log("Successfully uploaded image");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});