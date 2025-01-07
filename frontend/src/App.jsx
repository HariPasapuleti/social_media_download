import React, { useState } from "react";
import Header from "./components/Header";
import URLInput from "./components/URLInput";
import VideoOptions from "./components/VideoOptions";
import "./App.css";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState("");
  const [availableQualities, setAvailableQualities] = useState([]);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [url, setUrl] = useState(""); // Add this state


  const handleSignOut = () => {
    setIsLoggedIn(false);
  };

  const handleSearch = async (url) => {
    setLoading(true);
    setError(null);
    setThumbnailUrl("");
    setUrl(url);
  
    try {
      const encodedUrl = encodeURIComponent(url.trim());
      const response = await fetch(`http://localhost:8000/api/get-video-quality/?url=${encodedUrl}`);
      const data = await response.json();
  
      // Set thumbnail URL if available
      if (data.thumbnail) {
        setThumbnailUrl(data.thumbnail);
      }
  
      // Extract video qualities
      const qualities = data.qualities || [];
      if (qualities.length === 0) {
        setError("No video qualities available. Please check the URL.");
        return;
      }
      const allowedQualities = ["144p", "240p", "360p", "720p", "1080p", "2160p"];
  
      // Filter and remove duplicates
      const uniqueQualities = Array.from(
        new Map(
          qualities
            .filter((quality) => allowedQualities.includes(quality.quality)) // Allowed qualities only
            .map((quality) => [quality.quality, quality]) // Use quality as key to ensure uniqueness
        ).values()
      );
  
      setAvailableQualities(uniqueQualities);
    } catch (error) {
      console.error("Error fetching video details:", error);
      setError("Error fetching video details. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  const handleSelectQuality = (quality) => {
    setSelectedQuality(quality);
    console.log("Selected Quality:", quality); 
  };

 const handleDownload = async () => {
  if (!selectedQuality) {
    setError("Please select a video quality before downloading.");
    return;
  }
  try {
    const response = await fetch(
      `http://localhost:8000/api/download/?url=${encodeURIComponent(url)}&quality=${selectedQuality}`
    );

    if (!response.ok) {
      throw new Error("Error downloading the video. Please try again.");
    }

    // Create a link and trigger the download
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "video.mp4";
    link.click();

    // State reset after successful download
    window.URL.revokeObjectURL(url); // Clean up the URL object
    alert("Download successful!");
  } catch (error) {
    setError("Failed to download the video. Please try again.");
    console.error("Error:", error);
  }
};


  return (
    <div className="app">
      <Header isLoggedIn={isLoggedIn} onSignOut={handleSignOut} />
      <div className="content">
      <URLInput onSearch={handleSearch} />
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="video-preview">
          {thumbnailUrl && <img src={thumbnailUrl} alt="Video Thumbnail" className="thumbnail" />}
          <VideoOptions qualities={availableQualities} onSelectQuality={handleSelectQuality} />
          {selectedQuality && (
            <button onClick={handleDownload} className="download-button">
              Download Video
            </button>
          )}
        </div>
      )}
      {error && <div className="error-message">{error}</div>}
    </div>

    </div>
  );
  
};

export default App;
