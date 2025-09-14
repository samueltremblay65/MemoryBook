import { useState, useEffect } from "react";

export const CreateMemoryModal = ({ onSubmit, closeModal, errorMessage }) => {

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
  });

  function submitForm()
  {
    // No need to use a ref because this does nott impact rendering, just gets the files currently selected
    const files = document.getElementById("file_selector").files;

    onSubmit(title, location, date, content, files);
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
        <p className="close_button" onClick={() => closeModal("Modal was closed")}>&times;</p>

        <div className="modal-content">
          <h1 className="modal-title">New Memory</h1>

          <p className="error-message" style={{ visibility: (errorMessage === ""? "hidden": "visible")}}>{errorMessage}</p>

          <div className="form-field">
              <p className="form-label">Title</p>
              <input value={title} onChange={ e => setTitle(e.target.value)} placeholder="Memory Title" autoComplete="off"></input>
          </div>

          <div className="form-field">
              <p className="form-label">Location</p>
              <input value={location} onChange={ e => setLocation(e.target.value)} placeholder="Location" autoComplete="off"></input>
          </div>
          
          <div className="form-field">
              <p className="form-label">Date</p>
              <input value={date} onChange={ e => setDate(e.target.value)} placeholder="Date" autoComplete="off"></input>
          </div>

          <div className="form-field">
              <p className="form-label">Content</p>
              <textarea name="description" value={content} onChange={e => setContent(e.target.value)} placeholder="Describe this memory" autoComplete="off"></textarea>
          </div>


          <h3>Photos</h3>
          <input type="file" id="file_selector" name="files" multiple="multiple"></input>
          <br/>
          <button className="wide-button yellow" alt="submit button" style={{"marginTop": "10px"}} onClick={() => submitForm()}>Create</button>
        </div>
      </div>
    </div>
  );
};