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

// For development
const user_id = 1000;
const username = "Sam";
const password = "Password1"
const create_base_user = false;
const album_id = 1;
const create_base_album = false;

app.use("/images", express.static(img_path));

db = new sqlite3.Database(db_path, (err) => {
    if (err) {
        console.error(err.message);
    } else {
      // Create memories and pictures table if they don't exist
      db.run('CREATE TABLE IF NOT EXISTS users(user_id INTEGER PRIMARY KEY, username string, password string)');
      db.run('CREATE TABLE IF NOT EXISTS albums(album_id INTEGER PRIMARY KEY autoincrement, author INTEGER not null, name string not null, FOREIGN KEY(author) REFERENCES users(user_id))');
      db.run('CREATE TABLE IF NOT EXISTS memories(memory_id INTEGER PRIMARY KEY autoincrement, user INTEGER not null, album INTEGER not null, title string not null, content text, location string, date string, image_urls text, image_ids text, cover_url string, FOREIGN KEY(user) REFERENCES users(user_id), FOREIGN KEY(album) REFERENCES albums(album_id))');
      db.run(`CREATE TABLE IF NOT EXISTS pictures(picture_id INTEGER PRIMARY KEY autoincrement, source string not null, memory INTEGER not null, FOREIGN KEY(memory) REFERENCES memories(memory_id))`);
      
      // For development
      if(create_base_user) {
          db.run(`INSERT INTO users(user_id,username,password) VALUES (?,?,?)`, [user_id,username, password], function(error) {

          if (error) {
            return console.log(error.message);
          }

          console.log(`A row has been inserted with rowid ${this.lastID}`);
        });
      }
      if(create_base_album) {
        db.run(`INSERT INTO albums(author,name) VALUES (?,?)`, [user_id, "My Memory Album"], function(error) {
          if (error) {
            return console.log(error.message);
          }

        console.log(`A row has been inserted with rowid ${this.lastID}`);});
      }
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

  db.run(
    `INSERT INTO memories(user, album, title, content, location, date, cover_url, image_urls ) VALUES (?,?,?,?,?,?,?,?)`,
     [user_id, album_id, memory.title, memory.content, memory.location, memory.date, memory.cover_url, memory.image_urls],
     function(error) {
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

app.get('/memories/:id', async (req, res) => {
  const album_id = req.params.id;
  const memories = await db_fetch_all(`SELECT * FROM memories WHERE album=${album_id}`);
  res.json({memories: memories});
});

app.get('/albums/:id', async (req, res) => {
  const album_id = req.params.id;
  const album = await db_fetch_all(`SELECT * FROM albums WHERE album_id=${album_id} LIMIT 1`);
  res.json({album: album});
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

app.post('/delete', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  
  const body = Object.keys(req.body)[0];
  const memory = JSON.parse(body);

  if(!databaseOpen){
    openDatabase();
  }

  console.log("Deleting memory with id: " + memory.memory_id);

  await db.run(`DELETE FROM memories WHERE memory_id=${memory.memory_id};`);

  // Send OK status
  res.send();
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});