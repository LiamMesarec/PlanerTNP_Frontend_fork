import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Calendar from "./components/calendar/calendar";
import Navbar from "./components/navbar";
import Login from "./components/profile/login";
import Profile from "./components/profile/profile";
import Register from "./components/profile/register";
import TodoList from './components/todos/TodoList';
import TodoHistory from './components/todos/TodoHistory';
import React from "react";
import Settings from "./components/settings";
import { FontProvider, useFont } from "./context/FontContext";

function AppContent() {
  const { fontSize } = useFont();

  return (
    <div style={{ fontSize }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Calendar />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/todos" element={<TodoList />} />
        <Route path="/todos-history" element={<TodoHistory />} />
        <Route path="*" element={
          <div className="error-container">
            <h1 className="error-text">404 - Page Not Found</h1>
            <p className="error-description">The page you're looking for doesn't exist.</p>
          </div>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <FontProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </FontProvider>
  );
}

export default App;

