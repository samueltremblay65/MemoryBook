import './App.css';

import { memo, useState, useEffect } from "react";
import { createPortal } from "react-dom";

import { CreateMemoryModal } from "./CreateMemoryModal";
import { MemoryModal } from "./MemoryModal";

import {v4 as uuid_v4} from "uuid";

// Static resources
import profile_icon from './Images/icon_profile_dark.png'
import add_icon from './Images/icon_add.png'

function App() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [memoryOpen, setMemoryOpen] = useState(null);
  const [memories, setMemories] = useState([]);

  const rootURL = 'http://localhost:3001/static/';

  function handleCreateModalClose()
  {
    setCreateModalOpen(false);
  }

  function handleMemoryClose()
  {
    setMemoryOpen(null);
  }

  function showMemoryModal(memory)
  {
    setMemoryOpen(memory);
  }

  useEffect(() => {
    // Send request to fetch memories from memorybook database
    const request = new XMLHttpRequest();
    
    request.addEventListener('load', function () {
      if (this.readyState === 4 && this.status === 200) {
        var json = JSON.parse(request.responseText);
        setMemories(json.memories);
      }
    });
    
    request.open('GET', 'http://localhost:3001/memories', true);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send();

  }, []);

  // Creates a new memory from the user data
  function handleCreateModalSubmit(headline, location, dateString, content, file)
  {
    let cover_url = rootURL + file.name;

    const memory = {
      title: headline,
      cover_url: cover_url,
      location: location,
      content: content,
      date: dateString,
      file: file
    }

    setMemories((prev) => {return [...prev, memory]});
    handleCreateModalClose();
    saveMemory(memory);

    uploadImage(file);
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
      return(<div className="memoryContainer" onClick={() => {}}></div>) 
    }

    // Display memory container
    return (<div className="memoryContainer" onClick={() => showMemoryModal(props.memory)}>
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
    const ITEMS_PER_ROW = 3;

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
      <div className="profile_menu">
        <p>Hi Sam</p>
        <img src={profile_icon} height="48px" alt="profile icon"></img>
      </div>
    )
  }

  const uploadImage = async (image) => {
    let formData = new FormData()
    formData.append('file', image)
    const response = await fetch('http://localhost:3001/image', {
      method: 'POST',
      body: formData,
    })
  }

  // Display all the react app components of the home page
  return (
    <div className="App">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400&display=swap');
      </style>

      <header className="App-header">
        <div className="flex_inline">
          <h1>My Memories</h1>
          <img src={add_icon} height="40px" alt="profile icon" onClick={() => setCreateModalOpen(true)}></img>
        </div>
        <ProfileMenu />
        {createModalOpen &&
          createPortal(
            <CreateMemoryModal
              closeModal={handleCreateModalClose}
              onSubmit={handleCreateModalSubmit}
              onCancel={handleCreateModalClose}>
            </CreateMemoryModal>,
            document.body
          )}

        {memoryOpen != null &&
          createPortal(
            <MemoryModal
              closeModal={handleMemoryClose}
              onSubmit={handleMemoryClose}
              onCancel={handleMemoryClose}
              memory={memoryOpen}>
            </MemoryModal>,
            document.body
          )}


      </header>
      
      {memories.length > 0 &&
        <MemoryContainer memories={memories}/>
      }
      {memories.length === 0 &&
        <h2 className="message">This section is empty. Add memories by clicking the '+' button above</h2>
      }      
    </div>
  );
}

export default App;
