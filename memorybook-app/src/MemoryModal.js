import React from "react";

import icon_ellipsis from './Images/ellipsis-vertical.svg'

import { useState, useEffect } from "react";

export const MemoryModal = ({closeModal, memory }) => {
  const rootURL = "http://localhost:3001/images/";
  const image_urls = memory.image_urls.split(',');

  const [optionsMenu, setOptionsMenu] = useState(false);

  useEffect(() => {
    gotoContent();
  }, []);

  function encodeSpaces(str) {
    return str.replace(/\s/g, '%20');
  }

  function gotoContent() {
    const title = document.getElementsByClassName("modal-content")[0];
    title.scrollIntoView({ block: "end" });
  }

  function deleteMemory()
  {
    const json = JSON.stringify(memory);

    console.log(json);

    const request = new XMLHttpRequest();
    
    request.addEventListener('load', function () {
      if (this.readyState === 4 && this.status === 200) {
        closeModal("Modal was closed");
      }
    });
    
    request.open('POST', 'http://localhost:3001/memory/delete', true);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send(json);
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
          closeModal("Modal was closed");
      }}
    >
      <div className="modal memory">
        <div className="modal-header" onClick={() => closeModal("Modal was closed")}></div>
        <div className="modal-content">
          {image_urls.map((source) =>
            <img className="modal-cover" src={source} key={source} onLoad={gotoContent}></img>
          )}

          <div className="memory-content" onMouseLeave={hideMemoryOptionsMenu}>
            <div className="options-button" onClick={toggleMemoryOptionsMenu}>
              <span className="align-helper"></span>
              <img src={icon_ellipsis} height={"32px"}></img>
            </div>
            <div className="popup-toggle-menu" style={{visibility: optionsMenu? "visible" : "hidden" }}>
              <ul>
                <li>Edit memory</li>
                <li>Add to album</li>
                <li>Add to favourites</li>
                <li>Delete memory</li>
              </ul>
            </div>

            <h1 id="modal_title">{memory.title}</h1>
            <p className="small-text">{memory.location} | {memory.date}</p>
            <p>{memory.content}</p>
          </div>
        </div>
      </div>
    </div>
  );
};