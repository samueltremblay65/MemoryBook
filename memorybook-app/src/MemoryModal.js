import React from "react";

import icon_ellipsis from './Images/ellipsis-vertical.svg'

import { useState, useEffect } from "react";

export const MemoryModal = ({memory, closeModal }) => {
  const image_urls = memory.image_urls.split(',');

  const [optionsMenu, setOptionsMenu] = useState(false);

  useEffect(() => {
    gotoContent();
  }, []);

  function gotoContent() {
    const title = document.getElementsByClassName("modal-content")[0];
    title.scrollIntoView({ block: "end" });
  }

  function deleteMemory()
  {
    const json = JSON.stringify(memory);

    const request = new XMLHttpRequest();
    
    request.addEventListener('load', function () {
      if (this.readyState === 4 && this.status === 200) {
        closeModal({type: "delete", success: true});
      }
    });
    
    request.open('POST', 'http://localhost:3001/delete', true);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send(json);
  }

  function handleOptionsButtonClick(e) {
    // Bring the button towards the center of the screen to ensure menu into view
    if(e.clientY < 200) {
      e.target.scrollIntoView({ 
        block: 'center', 
        behavior: 'smooth'
      });
      
      // Prevents mouse leave and closing the menu in some cases
      setTimeout(toggleMemoryOptionsMenu, 500);
    }
    else {
      toggleMemoryOptionsMenu();
    }
  }

  function toggleMemoryOptionsMenu() {
    setOptionsMenu(prevState => !prevState);
  }

  function hideMemoryOptionsMenu() {
    setOptionsMenu(false);
  }

  return (
    <div
      className="modal-container"
      onClick={(e) => {
        if (e.target.className === "modal-container")
          closeModal({type: "close"});
      }}
    >
      <div className="modal memory">
        <div className="modal-header" onClick={() => closeModal({type: "close"})}></div>
        <div className="modal-content">
          {image_urls.map((source) =>
            <img className="modal-cover" src={source} key={source} onLoad={gotoContent}></img>
          )}

          <div className="memory-content">
            {/* Put button in container, and move container to where button is to have the pop up list downwards.
             Switch bottom = 0 to top = 0 to get the positioning correct */}
            <div className="popup-toggle-menu-container" onMouseLeave={hideMemoryOptionsMenu}>
              <div className="popup-toggle-menu memory-options-menu" style={{visibility: optionsMenu? "visible" : "hidden" }}>
                <ul>
                  <li>Edit memory</li>
                  <li onClick={deleteMemory}>Delete memory</li>
                </ul>
              </div>
            </div>
            <div className="memory-heading-container">
              <div className="memory-heading">
                <h1 id="modal_title">{memory.title}</h1>
                <p className="small-text">{memory.location} | {memory.date}</p>
              </div>
              <div className="options-button" onClick={handleOptionsButtonClick}>
                <span className="align-helper"></span>
                <img src={icon_ellipsis} height={"32px"}></img>
              </div>
            </div>
            <p>{memory.content}</p>
          </div>
        </div>
      </div>
    </div>
  );
};