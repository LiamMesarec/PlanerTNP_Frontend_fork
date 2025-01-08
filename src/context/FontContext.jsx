import React, { createContext, useContext, useState } from "react";

const FontContext = createContext();

export const FontProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState("16px"); // Podrazumevana veličina fonta

  return (
    <FontContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontContext.Provider>
  );
};

export const useFont = () => useContext(FontContext);
