import './App.css';

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

import { CreateMemoryModal } from "./CreateMemoryModal";
import { CreateAlbumModal } from "./CreateAlbumModal";
import { MemoryModal } from "./MemoryModal";
import { AccountModal } from './AccountModal';

import {v4 as uuid_v4} from "uuid";

// Static resources
import profile_icon from './Images/icon_profile_dark.png'
import add_icon from './Images/icon_add.png'
import logo from './Images/Logo.png'
import { useCallback } from 'react';

function App() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [memoryOpen, setMemoryOpen] = useState(null);
  const [createAlbumModal, setCreateAlbumModal] = useState(false);
  const [memories, setMemories] = useState([]);
  const [album, setAlbum] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [width, setWidth] = useState(window.innerWidth);

  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [profileMenuOptions, setProfileMenuOptions] = useState(false);

  // For development
  const rootURL = 'http://localhost:3001/images/';

  const [session, setSession] = useState("wait");

  const [menu, setMenu] = useState("");

  function accountActionHandler(hasExisitingAccount, username, password, name) {
    if(hasExisitingAccount) {
      const json = JSON.stringify({username: username, password: password});

      const request = new XMLHttpRequest();
      
      request.addEventListener('load', function () {
        if (this.readyState === 4 && this.status === 200) {
          const username = JSON.parse(request.responseText).username;
          const user_id = JSON.parse(request.responseText).user_id;
          setSession({username: username, user_id: user_id});

          sendAlbumListRequest(false);
        }
        else if (this.readyState === 4) {
          setErrorMessage(request.responseText);
        }
      });
      
      request.open('POST', 'http://localhost:3001/login', true);
      request.withCredentials = true;
      request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      request.send(json);
    }
    else {
      // Create new account 
      const json = JSON.stringify({username: username, password: password});

      const request = new XMLHttpRequest();
      
      request.addEventListener('load', function () {
        if (this.readyState === 4 && this.status === 200) {
          const username = JSON.parse(request.responseText).username;
          const user_id = JSON.parse(request.responseText).user_id;
          setSession({username: username, user_id: user_id});

          sendAlbumListRequest(false);
        }
        else if (this.readyState === 4) {
          setErrorMessage(request.responseText);
        }
      });
      
      request.open('POST', 'http://localhost:3001/signup', true);
      request.withCredentials = true;
      request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      request.send(json);
    }
  }

  function showToastMessage(message, length) {
    const DEFFAULT_TIMEOUT = 3000;
    const timeout = (length == null || length === "")? DEFFAULT_TIMEOUT:length;  
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, timeout);
  }

  function handleCreateAlbumClose()
  {
    document.body.style.overflow = "scroll";
    setCreateAlbumModal(false);
  }

  function handleCreateModalClose()
  {
    document.body.style.overflow = "scroll";
    setCreateModalOpen(false);
  }

  function handleMemoryClose(action)
  {
    setMemoryOpen(null);

    loadAlbum(album);

    if(action.type === "delete" && action.success) {
      showToastMessage("Memory was deleted successfully");
    }
  }

  function showMemoryModal(memory)
  {
    setMemoryOpen(memory);
  }

  function toggleProfileMenu() {
    setProfileMenuOptions(prev => !prev);
  }

  function hideProfileMenu() {
    setProfileMenuOptions(false);
  }

  function logout() {
    setSession(null);
    sendLogoutRequest();

    async function sendLogoutRequest() {
      const url = "http://localhost:3001/logout";
      try {
        const response = await fetch(url, {
          credentials: 'include' // 🔑 sends cookies with the request
        });
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
        console.log("Successfully logged out");
      } catch (error) {
        console.error(error.message);
      }
    }
  }

  const requestAllMemories = useCallback(() => {
    // Send request to fetch memories from memorybook database
    setAlbum({title: "All memories"});
    const request = new XMLHttpRequest();
    
    request.addEventListener('load', function () {
      if (this.readyState === 4 && this.status === 200) {
          var json = JSON.parse(request.responseText);
          setMemories(json.memories);
        }
    });
      
    request.open('GET', 'http://localhost:3001/memories', true);
    request.withCredentials = true;
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send();
  }, []);

  const requestMemoriesByAlbumId = useCallback(album_id => {
    // Send request to fetch memories from memorybook database
    const request = new XMLHttpRequest();
    
    request.addEventListener('load', function () {
      if (this.readyState === 4 && this.status === 200) {
          var json = JSON.parse(request.responseText);
          setMemories(json.memories);
      }
    });
      
    request.open('GET', 'http://localhost:3001/memories/' + album_id, true);
    request.withCredentials = true;
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send();
  }, []);

  const loadAlbum = useCallback((album) => {
    setAlbum(album);

    if (album == null || album.title === "All memories") {
      requestAllMemories();
    } else {
      requestMemoriesByAlbumId(album.album_id);
    }

    setMenu("");
  }, [requestAllMemories, requestMemoriesByAlbumId]);

  const sendAlbumListRequest = useCallback((openAlbum) => {
    // Send request to fetch album from memorybook database
    const request = new XMLHttpRequest();
    
    request.addEventListener('load', function () {
      if (this.readyState === 4 && this.status === 200) {
          var json = JSON.parse(request.responseText);
          setAlbums(json);
          if(openAlbum) loadAlbum(json[0]);
          else setMenu("album_list");
        }
    });
      
    request.open('GET', 'http://localhost:3001/user/albums', true);
    request.withCredentials = true;
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send();
  }, [loadAlbum]);

  useEffect(() => {
    async function getSession() {
      const url = "http://localhost:3001/session";
      try {
        const response = await fetch(url, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }

        const user = await response.json();

        if(!user) setSession(null);
        else {
          setSession({username: user.username, user_id: user.user_id});
          sendAlbumListRequest(false);
        }
      } catch (error) {
        console.error(error.message);
      }
    }

    getSession();

    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [sendAlbumListRequest]);

  function showAllMemories() {
    // Hackish but works well for now
    loadAlbum({title: "All memories"});
  }

  // Creates a new memory from the user data
  async function handleCreateModalSubmit(title, location, dateString, content, files) {
    const filenames = await uploadImages(files);

    let cover_url = rootURL + filenames[0];
    let image_urls = cover_url;

    for(var i = 1; i < filenames.length; i++)
    {
      image_urls += "," + (rootURL + filenames[i]);
    }

    const memory = {
      title: title,
      cover_url: cover_url,
      location: location,
      content: content,
      date: dateString,
      image_urls: image_urls,
      album_id: album.album_id
    }

    if(!memory.location)
    {
      memory.location = "Ottawa, Ontario";
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

    if(!memory.title || memory.title.trim() === "") {
      memory.title = "Memory from " + memory.date;
    }

    handleCreateModalClose();
    saveMemory(memory);
    requestMemoriesByAlbumId(album.album_id);
  }

    // Creates a new memory from the user data
  function handleCreateAlbumSubmit(title, description, cover)
  {
    const album = {
      title: title,
      description: description,
      cover: cover
    }

    handleCreateAlbumClose();
    createAlbum(album);
  }

  async function createAlbum(album) {
    const filenames = await uploadImages([album.cover]);
    const cover_url = filenames[0];

    const albumDBObject = {
      title: album.title,
      description: album.description,
      cover_url: rootURL + cover_url
    }

    const json = JSON.stringify(albumDBObject);
    const request = new XMLHttpRequest();
    
    request.addEventListener('load', function () {
      if (this.readyState === 4 && this.status === 200) {
        console.log(this.responseText);
        sendAlbumListRequest(false);
      }
    });
    
    request.open('POST', 'http://localhost:3001/create/album', true);
    request.withCredentials = true;
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send(json);
  }

  async function saveMemory(memory) {
    const json = JSON.stringify(memory);
    const request = new XMLHttpRequest();
    
    request.addEventListener('load', function () {
      if (this.readyState === 4 && this.status === 200) {
        console.log(this.responseText);
      }
    });
    
    request.open('POST', 'http://localhost:3001/create/memory', true);
    request.withCredentials = true;
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send(json);
  }

  // TODO: Refactor to reuse with MemoryContainer
  function AlbumContainer(props) {
    if(props == null || props.albums == null || props.albums.length === 0) {
      return <div>No albums to display</div>
    }

    const albums = props.albums;

    // TODO: determine best row size based on screen width
    const ITEM_SIZE = 375;
    const ITEMS_PER_ROW = Math.floor((width - 250) /  ITEM_SIZE);
    var numberRows = Math.ceil(albums.length / ITEMS_PER_ROW);

    var rows = [];
    var row = [];

    for(let i = 0; i < numberRows; i++) {
      for(let j = 0; j < ITEMS_PER_ROW; j++) {
        if(i * ITEMS_PER_ROW + j >= albums.length) {
          row.push({empty: true});
        }
        else row.push(albums[i * ITEMS_PER_ROW + j]);
      }
      rows.push(row);
      row = [];
    }

    return (
      <div className='grid-container no-select'>
        {rows.map(row => (
          <AlbumRow key={uuid_v4()} albums={row} />
        ))}
      </div>
    );
  }

  function AlbumRow(props)
  {
    const albumItems = props.albums.map(album => <Album key={album.album_id} album={album}/>)
    return (<div className="container-row">
      {albumItems}
    </div>);
  }

  function Album(props) {
    // Trick to get items to display correctly in rows
    if(props.album == null || props.album.empty)
    {
      return(<div className="grid-item-container no-select" style={{"width": "375px", "height": "375px"}} onClick={() => {}}></div>);
    }

    return (<div className="grid-item-container no-select" onClick={() => { setAlbum(props.album); requestMemoriesByAlbumId(props.album.album_id); setMenu(""); }}>
      {props.album.cover_url && <img src={props.album.cover_url} alt="album cover" style={{"width": "375px", "height": "375px"}}></img>}
      {!props.album.cover_url && <img src={logo} alt="album cover" width="300px" style={{"width": "375px", "height": "375px", "objectFit": "contain"}}></img>}
      <h2>{props.album.title}</h2>
    </div>);
  }

  function Memory(props) {
    // Trick to get items to display correctly in rows
    if(props.memory == null || props.memory.empty)
    {
      return(<div className="grid-item-container no-select" style={{"width": "375px", "height": "375px"}} onClick={() => {}}></div>) 
    }

    // Display memory container
    return (<div className="grid-item-container no-select" onClick={() => showMemoryModal(props.memory)}>
      <img src={props.memory.cover_url} alt="memory cover" style={{"width": "375px", "height": "375px"}}></img>
      <h2>{props.memory.title}</h2>
      <p>{props.memory.location} | {props.memory.date}</p>
    </div>)
  }

  function MemoryRow(props)
  {
    return (<div className="container-row">
      {props.memories.map(memory => (
          <Memory key={uuid_v4()} memory={memory} />
        ))}
    </div>);
  }

  function MemoryContainer(props)
  {
    const items = props.memories;

    // TODO: determine best row size based on screen width
    const ITEM_SIZE = 375;
    const ITEMS_PER_ROW = Math.floor((width - 250) /  ITEM_SIZE);
    var numberRows = Math.ceil(items.length / ITEMS_PER_ROW);

    var rows = [];
    var row = [];

    for(let i = 0; i < numberRows; i++) {
      for(let j = 0; j < ITEMS_PER_ROW; j++) {
        if(i * ITEMS_PER_ROW + j >= items.length) {
          row.push({empty: true});
        }
        else row.push(items[i * ITEMS_PER_ROW + j]);
      }
      rows.push(row);
      row = [];
    }

    return(      
    <div className="grid-container">
      {rows.map(row => (
          <MemoryRow key={uuid_v4()} memories={row} />
        ))}
    </div>);
  }

  function ProfileMenu()
  {
    return (
      <div className="profile_menu no-select">
        <p className='no-wrap no-select'>Hi {session.username}</p>
        <div className="popup-toggle-menu-container" onMouseLeave={hideProfileMenu}>
          <img src={profile_icon} onClick={toggleProfileMenu} height="48px" alt="profile icon"></img>

          <div className="profile-menu popup-toggle-menu" style={{visibility: profileMenuOptions? "visible" : "hidden" }}>
            <ul>
              <li onClick={() => {setMenu("album_list"); hideProfileMenu()}}>Memory albums</li>
              <li onClick={() => {showAllMemories(); hideProfileMenu();}}>View all memories</li>
              <li onClick={() => {logout(); hideProfileMenu();}}>Sign out</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  const uploadImages = async (files) => {
    let formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      // TODO: Add status for image
      const response = await fetch('http://localhost:3001/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const filenames = await response.json();

      requestMemoriesByAlbumId(album.album_id);

      return filenames;

    } catch (error) {
        console.error('Error uploading files:', error);
    }
  };

  if(session === "wait") {
    return (
      <div>Waiting</div>
    );
  }
  
  if(session == null) {
    return (
      <AccountModal submitHandler={accountActionHandler} errorMessage={errorMessage} setErrorMessage={setErrorMessage}/>
    );
  }

  if(session != null && menu === "album_list") {
      // If user is logged in, display main app
    return (
      <div className="App">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400&display=swap');
        </style>

        <header className="App-header">
          <div className="flex_inline no-select">
            <h1 style={{textAlign: "left"}}>My Memory Albums</h1>
            <img src={add_icon} height="40px" alt="create album icon" onClick={() => setCreateAlbumModal(true)}></img>
          </div>
          <ProfileMenu />

          {createAlbumModal &&
            createPortal(
              <CreateAlbumModal
                closeModal={handleCreateAlbumClose}
                onSubmit={handleCreateAlbumSubmit}
                errorMessage="">
              </CreateAlbumModal>,
              document.body
          )}

        </header>
      
        {menu === "album_list" && 
          <AlbumContainer albums={albums}/>
        } 
        <div style={{ opacity: toastVisible? 0.7: 0}} className="toast">
            <p>{toastMessage}</p>
        </div>
      </div>
    );
  }

  // If user is logged in, display main app
  return (
    <div className="App">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400&display=swap');
      </style>

      <header className="App-header">
        <div className="flex_inline no-select">
          <h1 style={{textAlign: "left"}}>{album.title}</h1>
          <img src={add_icon} height="40px" alt="profile icon" onClick={() => setCreateModalOpen(true)}></img>
        </div>
        <ProfileMenu />

        {/* Main page modals */}
        {createModalOpen &&
          createPortal(
            <CreateMemoryModal
              closeModal={handleCreateModalClose}
              onSubmit={handleCreateModalSubmit}
              errorMessage="">
            </CreateMemoryModal>,
            document.body
          )}

        {memoryOpen != null &&
          createPortal(
            <MemoryModal
              closeModal={handleMemoryClose}
              memory={memoryOpen}>
            </MemoryModal>,
            document.body
          )}
      </header>
      
      {menu === "" && memories.length > 0 &&
        <MemoryContainer memories={memories}/>
      }
      {menu === "" && memories.length === 0 &&
        <h2 className="message">This album is empty. Add memories by clicking the '+' button that appears when the cursor is hovering over the album name</h2>
      }

      <div style={{ opacity: toastVisible? 0.7: 0}} className="toast">
          <p>{toastMessage}</p>
      </div>
    </div>
  );
}

export default App;
