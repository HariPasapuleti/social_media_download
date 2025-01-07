import React, { useState } from "react";

const URLInput = ({ onSearch }) => {
  const [url, setUrl] = useState("");

  const handleChange = (event) => {
    setUrl(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(url);
  };

  return (
    <div className="url-input">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={url}
          onChange={handleChange}
          placeholder="Enter YouTube URL"
        />
        <button type="submit">Search</button>
      </form>
    </div>
  );
};

export default URLInput;
