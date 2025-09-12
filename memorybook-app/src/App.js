import './App.css';

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

import { CreateMemoryModal } from "./CreateMemoryModal";
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
  const [memories, setMemories] = useState([]);
  const [album, setAlbum] = useState([]);
  const [width, setWidth] = useState(window.innerWidth);

  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [profileMenuOptions, setProfileMenuOptions] = useState(false);

  const rootURL = 'http://localhost:3001/images/';
  const album_id = 1;

  const [session, setSession] = useState("");

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

  function handleCreateModalClose()
  {
    document.body.style.overflow = "scroll";
    setCreateModalOpen(false);
  }

  function handleMemoryClose(action)
  {
    setMemoryOpen(null);
    sendMemoryRequest();

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
    sendAlbumRequest();
    sendMemoryRequest();

    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  function sendAlbumRequest() {
    // Send request to fetch album from memorybook database
    const request = new XMLHttpRequest();
    
    request.addEventListener('load', function () {
      if (this.readyState === 4 && this.status === 200) {
          var json = JSON.parse(request.responseText);
          setAlbum(json.album[0]);
        }
      });
      
      request.open('GET', 'http://localhost:3001/albums/' + album_id, true);
      request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      request.send();
  }

  function sendMemoryRequest() {
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
  function handleCreateModalSubmit(title, location, dateString, content, files)
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
      image_urls: image_urls
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
    sendMemoryRequest();
  }

  function saveMemory(memory) { 
    const json = JSON.stringify(memory);

    const request = new XMLHttpRequest();
    
    request.addEventListener('load', function () {
      if (this.readyState === 4 && this.status === 200) {
        console.log(this.responseText);
      }
    });
    
    request.open('POST', 'http://localhost:3001/create', true);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send(json);
}

  function Memory(props) {
    // Trick to get items to display correctly in rows
    if(props.memory.empty)
    {
      return(<div className="memory-container no-select" onClick={() => {}}></div>) 
    }

    // Display memory container
    return (<div className="memory-container no-select" onClick={() => showMemoryModal(props.memory)}>
      <img src={props.memory.cover_url} alt="memory cover"></img>
      <h2>{props.memory.title}</h2>
      <p>{props.memory.location} | {props.memory.date}</p>
    </div>)
  }

  function MemoryRow(props)
  {
    return (<div className="container_row">
      {props.memories.map(memory => (
          <Memory key={memory.memory_id || uuid_v4()} memory={memory} />
        ))}
    </div>);
  }

  function MemoryContainer(props)
  {
    const memories = props.memories;
    const numberMemories = memories.length;

    // TODO: determine best row size based on screen width
    const ITEM_SIZE = 375;
    let ITEMS_PER_ROW = 3;

    ITEMS_PER_ROW = (width - 250) /  ITEM_SIZE;

    ITEMS_PER_ROW = Math.floor(ITEMS_PER_ROW);

    var rows = [];

    // Put memories into different rows, render all rows
    var i = 0;
    var row = [];

    while(i < numberMemories)
    {
      row.push(memories[i])
      if((i+1) % ITEMS_PER_ROW === 0)
      {
        rows.push(row);
        row = [];
      }
      i++;
    }

    if(i % ITEMS_PER_ROW !== 0)
    {
      for(var j = 0; j < ITEMS_PER_ROW - (i % ITEMS_PER_ROW); j++)
      {
        row.push({empty: true});
      }
      rows.push(row);
    }

    return(      
    <div className="container">
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
              <li>Memory albums</li>
              <li>View all memories</li>
              <li>View profile</li>
              <li onClick={() => setSession("")}>Sign out</li>
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

  // If user is logged in, display main app
  return (
    <div className="App">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400&display=swap');
      </style>

      <header className="App-header">
        <div className="flex_inline no-select">
          <h1 style={{textAlign: "left"}}>{album.name}</h1>
          <img src={add_icon} height="40px" alt="profile icon" onClick={() => setCreateModalOpen(true)}></img>
        </div>
        <ProfileMenu />
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
      
      {memories.length > 0 &&
        <MemoryContainer memories={memories}/>
      }
      {memories.length === 0 &&
        <h2 className="message">This album is empty. Add memories by clicking the '+' button that appears when the cursor is hovering over the album name</h2>
      }

      <div style={{ opacity: toastVisible? 0.7: 0}} className="toast">
          <p>{toastMessage}</p>
      </div>
    </div>
  );
}

export default App;
