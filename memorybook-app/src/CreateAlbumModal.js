import { useState, useEffect } from "react";

export const CreateAlbumModal = ({ onSubmit, closeModal, errorMessage }) => {

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
  });

  function submitForm()
  {
    // No need to use a ref because this does nott impact rendering, just gets the files currently selected
    const cover = document.getElementById("cover_selector").files[0];

    onSubmit(title, description, cover);
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
          <h1 className="modal-title">New Album</h1>

          <p className="error-message" style={{ visibility: (errorMessage == ""? "hidden": "visible")}}>{errorMessage}</p>

          <div className="form-field">
              <p className="form-label">Title</p>
              <input value={title} onChange={ e => setTitle(e.target.value)} placeholder="Album title" autoComplete="off"></input>
          </div>

          <div className="form-field">
              <p className="form-label">Description</p>
              <textarea name="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe this album" autoComplete="off"></textarea>
          </div>

          <h3>Cover photo</h3>
          <p>Select a cover photo for this album</p>
          <input type="file" id="cover_selector" name="files" multiple="multiple"></input>
          <br/>
          <button className="wide-button yellow" alt="submit button" style={{"marginTop": "10px"}} onClick={() => submitForm()}>Create Album</button>
        </div>
      </div>
    </div>
  );
};