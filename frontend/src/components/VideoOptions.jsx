import React from "react";

const VideoOptions = ({ qualities, onSelectQuality }) => {
  return (
    <div className="video-options">
      <label>Select Video Quality:</label>
      <select onChange={(e) => onSelectQuality(e.target.value)}>
        <option value="">Select Quality</option>
        {qualities.map((quality, index) => (
          <option key={index} value={quality.quality}> {/* Use quality.quality if you need to pass quality name */}
            {quality.quality}
          </option>
        ))}
      </select>
    </div>
  );
};

export default VideoOptions;
