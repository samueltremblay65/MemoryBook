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
const create_base_album = false;
let currentUser = null;

app.use("/images", express.static(img_path));

db = new sqlite3.Database(db_path, (err) => {
    if (err) {
        console.error(err.message);
    } else {
      // Create memories and pictures table if they don't exist
      db.run('CREATE TABLE IF NOT EXISTS users(user_id INTEGER PRIMARY KEY, username string, password string)');
      db.run('CREATE TABLE IF NOT EXISTS albums(album_id INTEGER PRIMARY KEY autoincrement, title string not null, author INTEGER not null, description text, date string, location string, cover_url string, FOREIGN KEY(author) REFERENCES users(user_id))');
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
        db.run(`INSERT INTO albums(title, author, description, cover_url) VALUES (?,?,?,?)`, ["My Memory Album", user_id, "", ""], function(error) {
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

function createAlbum(album) {
  if(!databaseOpen)
  {
    openDatabase();
  }

  db.run(
    `INSERT INTO albums(title, author, description, cover_url) VALUES (?,?,?,?)`,
     [album.title, currentUser.user_id, album.description, album.cover_url],
     function(error) {
      if (error) {
        return console.log(error.message);
      }

      console.log(`A row has been inserted with rowid ${this.lastID}`);
  });
}

async function saveMemory(memory)
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
     [user_id, memory.album_id, memory.title, memory.content, memory.location, memory.date, memory.cover_url, memory.image_urls],
     function(error) {
      if (error) {
        return console.log(error.message);
      }

      console.log(`A row has been inserted with rowid ${this.lastID}`);
  });

  // Give album the memory cover if album has no cover_url
  const album = await getAlbumById(memory.album_id);
  if(album.cover_url == null) {
    console.log(memory.cover_url);
    const updateQuery = `UPDATE albums SET cover_url = "${memory.cover_url}" WHERE album_id = ${album.album_id}`;
    db.run(updateQuery, function (err) {
      if (err) {
        console.error('Error updating cover_url:', err.message);
      }
    });
  }
}

async function getUserById(id) {
  const response = await db_fetch_all(`SELECT * FROM users WHERE user_id=${id} LIMIT 1`);
  return response[0];
}

async function getAlbumById(id) {
  const response = await db_fetch_all(`SELECT * FROM albums WHERE album_id=${id} LIMIT 1`);
  return response[0];
}

async function db_has_match(query){
  return new Promise(function(resolve, reject){
    if(!databaseOpen)
    {
      openDatabase();
    }

    db.all(query, function(err, rows) {
      if(rows == undefined) resolve(false);
      else{
        if(rows.length == 0) resolve(false);
        if(rows[0] == null) resolve(false);
        else resolve(true);
      }
    });
  });
}

async function db_fetch_all(query){
  return new Promise(function(resolve, reject){
    if(!databaseOpen)
    {
      openDatabase();
    }

    db.all(query, function(err, rows){
        if(err){return reject(err);}
        resolve(rows);
      });
  });
}

app.post('/login', urlencodedParser, async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  
  const body = Object.keys(req.body)[0];

  const info = JSON.parse(body);

  const username = info.username;
  const password = info.password;

  // TODO: Salt and hash

  const database_match = await db_fetch_all(`SELECT * FROM users WHERE username="${username}"`);

  if(database_match.length == 0) {
    // No account found with username
    res.status(404);
    res.send("No account found with this username");
  } else if(database_match[0].password != password) {
    // Password invalid
    res.status(401);
    res.send("Password is incorrect");
  } else {
    // Successful login
    res.status(200);
    console.log(`User ${database_match[0].username} (ID#${database_match[0].user_id}) logged in successfully`);
    res.send({user_id: database_match[0].user_id, username: database_match[0].username});
    currentUser = database_match[0];
  }
});

app.post('/signup', urlencodedParser, async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  
  const body = Object.keys(req.body)[0];

  const info = JSON.parse(body);

  const username = info.username;
  const password = info.password;
  // TODO: Salt and hash

  // Find empty id
  let user_id;
  do {
    user_id = Math.floor(10000 + Math.random() * 90000);
  }while(await db_has_match(`SELECT * FROM users WHERE user_id=${user_id}`));

  const database_match = await db_has_match(`SELECT * FROM users WHERE username="${username}"`);

  if(database_match) {
    // Account already exists
    res.status(400);
    res.send("This username is already taken");
  } else {
    // TODO: Perform proper validation
    if(username.length < 3 || username.length > 64) {
      console.log("Short username");
      res.status(400);
      res.send("Username must be between 6 and 64 characters");
    } if(password.length < 6 || password.length > 64) {
      res.status(400);
      res.send("Password must be between 6 and 64 characters");
    }
    else {
        // Proceeding to account creation in database 
        db.run(
        `INSERT INTO users(user_id, username, password) VALUES (?,?,?)`,
        [user_id, username, password],
        async function(error) {
          if (error) {
            res.status(400);
            res.send("Account not created: account credentials are invalid");
            return console.log(error.message);
          }

          console.log(`A row has been inserted with rowid ${this.lastID}`);

          const user = await getUserById(user_id);
          // For development
          currentUser = user;

          const starterAlbum = {title: "My memory album", author: user.user_id, description: "", cover_url: null}
          createAlbum(starterAlbum);

          res.send({username: user.username, user_id: user.user_id});
      });
    }
  }
});

app.post('/create/album', urlencodedParser, (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  const body = Object.keys(req.body)[0];
  const album = JSON.parse(body);

  createAlbum(album);

  res.send();
});

app.post('/create/memory', urlencodedParser, (req, res) => {
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

app.get('/user/albums', async (req, res) => {
  const albums = await db_fetch_all(`SELECT * FROM albums WHERE author=${currentUser.user_id} LIMIT 25`);
  res.json(albums);
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

app.get('/test', (req, res) => {
  res.send(`${req.protocol}://${req.headers['host']}/image`);
});

const upload = multer({ storage: storage });

app.post('/image', upload.array('files'), function (req, res) {
  res.status(200).json({ message: 'Files uploaded successfully!' });
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