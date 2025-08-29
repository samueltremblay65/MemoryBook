import React from "react";

import { useState } from "react";

export const MemoryModal = ({ onSubmit, onCancel, closeModal, memory }) => {

  const [image, setImage] = useState(memory.cover_url);
  const [imageNumber, setImageNumber] = useState(0);

  const rootURL = "http://localhost:3001/static/";

  function showNextImage()
  {
    const images = memory.image_urls.split(',');

    console.log(imageNumber);

    console.log(images.length);
    setImage(rootURL + images[imageNumber]);

    console.log(rootURL + images[imageNumber])

    setImageNumber((prevState) => ( (prevState + 1) % images.length ));
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
            <img className="modal-cover" src={image} onClick={showNextImage}></img>
            <div className="memory-content">
              <h1>{memory.title}</h1>
              <p className="small-text">{memory.location} | {memory.date}</p>
              <p>{memory.content}</p>
            </div>

            <button onClick={deleteMemory}>Delete</button>

        </div>
      </div>
    </div>
  );
};