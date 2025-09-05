import React from "react";

import check_icon from './Images/checkmark.png'

export const CreateMemoryModal = ({ onSubmit, onCancel, closeModal }) => {

  function submitForm()
  {
    const headline = document.getElementById("cm_headline").value;
    const location = document.getElementById("cm_location").value;
    const date = document.getElementById("cm_date").value;
    const content = document.getElementById("cm_content").value;
    const files = document.getElementById("file_selector").files;

    onSubmit(headline, location, date, content, files);
  }

  return (
    <div
      className="modal-container"
      onClick={(e) => {
        if (e.target.className === "modal-container")
          closeModal("Modal was closed");
      }}
    >
      <div className="modal padded-modal form-modal">
        <div className="modal-header" onClick={() => closeModal("Modal was closed")}>
          <p className="close_button">&times;</p>
        </div>

        <div className="modal-content">

          <h3>Title</h3>
          <input name="headline" id="cm_headline" placeholder="Short description of your memory" autoComplete="off"></input>

          <h3>Location</h3>
          <input name="location" id="cm_location" placeholder="Where?" autoComplete="off"></input>

          <h3>Date</h3>
          <input name="location" id="cm_date" placeholder="When?" autoComplete="off"></input>

          <h3>Content</h3>
          <textarea name="description" id="cm_content" placeholder="Describe this memory" autoComplete="off"></textarea>

          <h3>Photos</h3>
          <input type="file" id="file_selector" name="files" multiple="multiple" autoComplete="off"></input>

        </div>
        
        <div className="modal-footer">
          <img className="check_icon" alt="submit button" src={check_icon} width="50px" onClick={() => submitForm()}></img>
        </div>
      </div>
    </div>
  );
};