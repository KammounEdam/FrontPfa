import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileImage, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import Annotate from "./Annotate";

const UploadAndDisplayImage = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  const Trash = <FontAwesomeIcon icon={faTrashAlt} />;
  const FileImage = <FontAwesomeIcon icon={faFileImage} />;

  function refreshPage() {
    if (window.confirm("You will lose all annotations along with the image! Do you want to proceed?")) {
      setSelectedImage(null);
      window.location.reload(true);
    }
  }

  return (
    <div className="container mt-5">
      <h1>Upload and Display Image for Annotation</h1>

      {selectedImage && (
        <div className="image-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
          <Annotate filedata={selectedImage} />
          <button id="toggle-btn" onClick={refreshPage}>
            <i style={{ padding: '5px' }}>{Trash}</i>
            Remove
          </button>
        </div>
      )}

      <br /><br />

      {!selectedImage && (
        <div>
          <label id="button-icon"><i style={{ padding: '5px' }}>{FileImage}</i></label>
          <input
            style={{
              border: 'none',
              padding: '16px 32px',
              textDecoration: 'none',
              margin: '4px 2px',
              cursor: 'pointer'
            }}
            type="file"
            accept="image/*"
            name="myImage"
            onChange={(event) => {
              setSelectedImage(event.target.files[0]);
            }}
            required
          />
          <br /><br /><br /><br />
        </div>
      )}
    </div>
  );
};

export default UploadAndDisplayImage;