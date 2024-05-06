import React from "react";

export const MemoryModal = ({ onSubmit, onCancel, closeModal, memory }) => {
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
            <img className="modal-cover" src={memory.cover_url}></img>
            <div className="memory-content">
              <h1>{memory.title}</h1>
              <p>{memory.location} | {memory.date}</p>
              <hr></hr>
              <p>{memory.content}</p>
            </div>

        </div>
      </div>
    </div>
  );
};