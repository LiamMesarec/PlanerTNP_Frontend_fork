import React, { useState } from "react";
import { useFont } from "../context/FontContext";
import './settings.css';

const Settings = () => {
  const { fontSize, setFontSize } = useFont();
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [fontFamily, setFontFamily] = useState("Arial, sans-serif");
  const [borderRadius, setBorderRadius] = useState("0px");
  const [animationSpeed, setAnimationSpeed] = useState("1s");

  const handleFontChange = (e) => {
    setFontSize(e.target.value);
  };

  const handleBackgroundChange = (e) => {
    setBackgroundColor(e.target.value);
    document.body.style.backgroundColor = e.target.value;
  };

  const handleFontFamilyChange = (e) => {
    setFontFamily(e.target.value);
    document.body.style.fontFamily = e.target.value;
  };

  const handleBorderRadiusChange = (e) => {
    setBorderRadius(e.target.value);
    document.body.style.borderRadius = e.target.value;
  };

  const handleAnimationSpeedChange = (e) => {
    setAnimationSpeed(e.target.value);
    document.body.style.transition = `all ${e.target.value} ease-in-out`;
  };

  return (
    <div className="settings-container" style={{ borderRadius: borderRadius }}>
      <h1>Settings</h1>
      <p>Current Font Size: {fontSize}</p>
      <label htmlFor="font-size">Select Font Size:</label>
      <select
        id="font-size"
        value={fontSize}
        onChange={handleFontChange}
      >
        <option value="12px">Small</option>
        <option value="16px">Default</option>
        <option value="20px">Large</option>
        <option value="24px">Extra Large</option>
      </select>

      <p>Current Background Color: {backgroundColor}</p>
      <label htmlFor="background-color">Select Background Color:</label>
      <select
        id="background-color"
        value={backgroundColor}
        onChange={handleBackgroundChange}
      >
        <option value="#ffffff">White</option>
        <option value="#f0f8ff">Alice Blue</option>
        <option value="#add8e6">Light Blue</option>
        <option value="#f5f5f5">Light Grey</option>
        <option value="#4a90e2">Blue</option>
      </select>

      <p>Current Font Family: {fontFamily}</p>
      <label htmlFor="font-family">Select Font Family:</label>
      <select
        id="font-family"
        value={fontFamily}
        onChange={handleFontFamilyChange}
      >
        <option value="Arial, sans-serif">Arial</option>
        <option value="'Poppins', sans-serif">Poppins</option>
        <option value="'Times New Roman', serif">Times New Roman</option>
        <option value="'Courier New', monospace">Courier New</option>
        <option value="'Georgia', serif">Georgia</option>
      </select>

      <p>Current Border Radius: {borderRadius}</p>
      <label htmlFor="border-radius">Select Border Radius:</label>
      <select
        id="border-radius"
        value={borderRadius}
        onChange={handleBorderRadiusChange}
      >
        <option value="0px">None</option>
        <option value="10px">Small</option>
        <option value="20px">Medium</option>
        <option value="30px">Large</option>
        <option value="50px">Extra Large</option>
      </select>
    </div>
  );
};

export default Settings;
