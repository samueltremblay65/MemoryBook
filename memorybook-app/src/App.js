import './App.css';

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

import { CreateMemoryModal } from "./CreateMemoryModal";
import { CreateAlbumModal } from "./CreateAlbumModal";
import { MemoryModal } from "./MemoryModal";
import { AccountModal } from './AccountModal';

import {v4 as uuid_v4} from "uuid";

// Static resources
import profile_icon from './Images/icon_profile_dark.png'
import add_icon from './Images/icon_add.png'
import expand_icon from './Images/icon_expand.png'

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

  const rootURL = 'http://localhost:3001/images/';

  const [session, setSession] = useState("");

  const [menu, setMenu] = useState("");

  function accountActionHandler(hasExisitingAccount, username, password, name) {
    if(hasExisitingAccount) {
      const json = JSON.stringify({username: username, password: password});

      const request = new XMLHttpRequest();
      
      request.addEventListener('load', function () {
        if (this.readyState === 4 && this.status === 200) {
          console.log(request.responseText);
          var username = JSON.parse(request.responseText).username;
          setSession(username);
        }
        else if (this.readyState === 4) {
          setErrorMessage(request.responseText);
        }
      });
      
      request.open('POST', 'http://localhost:3001/login', true);
      request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      request.send(json);
    }
    else {
      // Create new account 
      const json = JSON.stringify({username: username, password: password});

      const request = new XMLHttpRequest();
      
      request.addEventListener('load', function () {
        if (this.readyState === 4 && this.status === 200) {
          console.log(request.responseText);
          const username = JSON.parse(request.responseText).username;
          setSession(username);
        }
        else if (this.readyState === 4) {
          setErrorMessage(request.responseText);
        }
      });
      
      request.open('POST', 'http://localhost:3001/signup', true);
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
    requestMemoriesByAlbumId(album.album_id);

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

  useEffect(() => {
    sendAlbumListRequest();
    requestAlbumById(1);

    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const requestAlbumById = useCallback((album_id) => {
    // Send request to fetch album from memorybook database
    const request = new XMLHttpRequest();
    
    request.addEventListener('load', function () {
      if (this.readyState === 4 && this.status === 200) {
          var json = JSON.parse(request.responseText);
          setAlbum(json.album[0]);
          requestMemoriesByAlbumId(json.album[0].album_id);
        }
      });
      
      request.open('GET', 'http://localhost:3001/albums/' + album_id, true);
      request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      request.send();
  }, []);

  function sendAlbumListRequest() {
        // Send request to fetch album from memorybook database
    const request = new XMLHttpRequest();
    
    request.addEventListener('load', function () {
      if (this.readyState === 4 && this.status === 200) {
          var json = JSON.parse(request.responseText);
          setAlbums(json);
        }
      });
      
      request.open('GET', 'http://localhost:3001/albums/', true);
      request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      request.send();
  }

  function requestMemoriesByAlbumId(album_id) {
    // Send request to fetch memories from memorybook database
    const request = new XMLHttpRequest();
    
    request.addEventListener('load', function () {
      if (this.readyState === 4 && this.status === 200) {
          var json = JSON.parse(request.responseText);
          setMemories(json.memories);
        }
      });
      
      request.open('GET', 'http://localhost:3001/memories/' + album_id, true);
      request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      request.send();
  }

  // Creates a new memory from the user data
  function handleCreateModalSubmit(title, location, dateString, content, files, album_id)
  {
    let cover_url = rootURL + files[0].name;
    let image_urls = cover_url;

    for(var i = 1; i < files.length; i++)
    {
      image_urls += "," + (rootURL + files[i].name);
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

    uploadImage(files);
    requestMemoriesByAlbumId(album.album_id);
  }

    // Creates a new memory from the user data
  function handleCreateAlbumSubmit(title, description, cover)
  {
    let cover_url = rootURL + cover.name;

    const album = {
      title: title,
      description: description,
      cover_url: cover_url
    }

    handleCreateAlbumClose();
    uploadImage([cover]);
    createAlbum(album);
  }

  function createAlbum(album) {
    const json = JSON.stringify(album);

    const request = new XMLHttpRequest();
    
    request.addEventListener('load', function () {
      if (this.readyState === 4 && this.status === 200) {
        console.log(this.responseText);
      }
    });
    
    request.open('POST', 'http://localhost:3001/create/album', true);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send(json);
  }

  function saveMemory(memory) { 
    const json = JSON.stringify(memory);

    const request = new XMLHttpRequest();
    
    request.addEventListener('load', function () {
      if (this.readyState === 4 && this.status === 200) {
        console.log(this.responseText);
      }
    });
    
    request.open('POST', 'http://localhost:3001/create/memory', true);
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
      <img src={props.album.cover_url} alt="album cover" style={{"width": "375px", "height": "375px"}}></img>
      <h2>{props.album.title}</h2>
    </div>);
  }

  function Memory(props) {
    // Trick to get items to display correctly in rows
    console.log(props);
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
    console.log("Number of items: " + props.memories.length); 
    return (<div className="container-row">
      {props.memories.map(memory => (
          <Memory key={uuid_v4()} memory={memory} />
        ))}
    </div>);
  }

  function MemoryContainer(props)
  {
    const memories = props.memories;

    // TODO: determine best row size based on screen width
    const ITEM_SIZE = 375;
    const ITEMS_PER_ROW = Math.floor((width - 250) /  ITEM_SIZE);
    var numberRows = Math.ceil(memories.length / ITEMS_PER_ROW);

    var rows = [];
    var row = [];

    for(let i = 0; i < numberRows; i++) {
      for(let j = 0; j < ITEMS_PER_ROW; j++) {
        if(i * ITEMS_PER_ROW + j >= albums.length) {
          row.push({empty: true});
        }
        else row.push(memories[i * ITEMS_PER_ROW + j]);
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
        <p className='no-wrap no-select'>Hi {session}</p>
        <div className="popup-toggle-menu-container" onMouseLeave={hideProfileMenu}>
          <img src={profile_icon} onClick={toggleProfileMenu} height="48px" alt="profile icon"></img>

          <div className="profile-menu popup-toggle-menu" style={{visibility: profileMenuOptions? "visible" : "hidden" }}>
            <ul>
              <li onClick={() => {setMenu("album_list"); hideProfileMenu()}}>Memory albums</li>
              <li>View all memories</li>
              <li>View profile</li>
              <li onClick={() => {setSession(""); hideProfileMenu();}}>Sign out</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  const uploadImage = async (files) => {
    let formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    // TODO: Add status for image
    const response = await fetch('http://localhost:3001/image', {
      method: 'POST',
      body: formData,
    });
  }
  
  if(session === "") {
    return (
      <AccountModal submitHandler={accountActionHandler} errorMessage={errorMessage} setErrorMessage={setErrorMessage}/>
    );
  }

  if(menu === "album_list") {
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
