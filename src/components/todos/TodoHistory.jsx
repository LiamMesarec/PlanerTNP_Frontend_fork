import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookie from "js-cookie";
import env from "../../env.json";
import './todoHistory.css';
import TaskModal from '../taskModal';

function TodoHistory() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState('endDate'); // Default sort by end date
  const [searchQuery, setSearchQuery] = useState(''); // State for search query

  const currentDate = new Date();
  const currentDateTimeString = currentDate.toISOString().slice(0, 16);

  const midnight = new Date();
  midnight.setHours(23, 59, 59, 999);
  const midnightTimeString = midnight.toISOString().slice(0, 16);

  const [newTask, setNewTask] = useState({
    name: '',
    urgent: false,
    color: '#3498db',
    startDateTime: currentDateTimeString,
    endDateTime: midnightTimeString,
  });

  const filters = [
    '#1abc9c',
    '#2ecc71',
    '#3498db',
    '#9b59b6',
    '#f1c40f',
    '#e67e22',
    '#e74c3c',
    '#34495e',
    '#95a5a6',
    '#7f8c8d',
  ];

  useEffect(() => {
    const user = JSON.parse(Cookie.get("signed_in_user"));
    axios.get(`${env.api}/task/user/${user._id}/tasks/all`)
      .then((response) => {
        setTasks(response.data.tasks);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [showModal]);

  const handleAddTask = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewTask({
      name: '',
      urgent: false,
      color: '#3498db',
      startDateTime: currentDateTimeString,
      endDateTime: midnightTimeString,
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewTask((prevTask) => ({
      ...prevTask,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTask.name.trim() === '') return;

    const startDateTime = new Date(newTask.startDateTime);
    const endDateTime = new Date(newTask.endDateTime);

    if (endDateTime < startDateTime) {
      alert('End date and time cannot be before start date and time.');
      return;
    }

    const user = JSON.parse(Cookie.get("signed_in_user"));
    axios.post(`${env.api}/task/user/${user._id}/tasks/all`, newTask, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      handleCloseModal();
    }).catch((error) => {
      console.log(error);
    });
  };

  const handleEditTask = (task) => {
    setNewTask({ ...task });
    setShowModal(true);
  };

  const handleDeleteTask = (taskId) => {
    const user = JSON.parse(Cookie.get("signed_in_user"));
    axios.delete(`${env.api}/task/user/${user._id}/tasks/${taskId}`)
      .then(() => {
        setTasks((prevTasks) => prevTasks.filter(task => task._id !== taskId));
      })
      .catch((error) => console.log(error));
  };

  // Toggle sort order
  const handleSortToggle = () => {
    setSortBy(sortBy === 'endDate' ? 'activity' : 'endDate');
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const renderTasks = () => {
    let sortedTasks = [...tasks];

    // Filter tasks based on the search query
    if (searchQuery) {
      sortedTasks = sortedTasks.filter((task) =>
        task.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortBy === 'endDate') {
      // Sort by end date (ascending)
      sortedTasks.sort((a, b) => new Date(a.endDateTime) - new Date(b.endDateTime));
    } else {
      // Sort by task activity (deleted first, then active tasks)
      sortedTasks.sort((a, b) => {
        if (a.deleted && !b.deleted) return 1;
        if (!a.deleted && b.deleted) return -1;
        return 0;
      });
    }

    return sortedTasks.map((task, index) => (
      <li
        key={index}
        className="task-item"
        style={{
          backgroundColor: task.deleted ? '#ffe6e6' : new Date(task.endDateTime) < new Date() ? '#d3d3d3' : '#c1ffcd',
        }}
      >
        <div className="task-content">
          <div
            className="color-circle"
            style={{ backgroundColor: task.color }}
          ></div>
          <span className={`task-name ${task.urgent ? 'urgent' : ''}`}>
            {task.name}
          </span>
          <span className="task-date">
            {new Date(task.startDateTime).toLocaleString('en-GB')} -{' '}
            {new Date(task.endDateTime).toLocaleString('en-GB')}
          </span>
          <div className="task-buttons">
            {task.deleted ? (
              <button
                className="delete-button"
                style={{ marginLeft: '15px', backgroundColor: 'orangered' }}
                onClick={() => handleEditTask(task)}
              >
                Restore
              </button>
            ) : (
              <>
                <button
                  className="delete-button"
                  style={{ marginLeft: '15px', backgroundColor: 'cornflowerblue' }}
                  onClick={() => handleEditTask(task)}
                >
                  Edit
                </button>
                <button
                  className="delete-button"
                  style={{ marginLeft: '15px' }}
                  onClick={() => handleDeleteTask(task._id)}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </li>
    ));
  };

  return (
    <div className="page-background">
      <div className="todo-container">
        <h1>My Todos</h1>
        <div className="todo-list">
          <div className="todo-header">
            <button className="sort-button" onClick={handleSortToggle}>
              Sort by {sortBy === 'endDate' ? 'End Date' : 'Activity'}
            </button>
            <input
              type="text"
              className="search-bar"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <button className="add-task-button" onClick={handleAddTask}>
              +
            </button>
          </div>
          <ul>{renderTasks()}</ul>
        </div>
      </div>

      {showModal && (
        <TaskModal
          key={Date.now()}
          task={newTask}
          filters={filters}
          onSave={handleSubmit}
          onClose={handleCloseModal}
          onInputChange={handleInputChange}
          checked={newTask.urgent}
        />
      )}
    </div>
  );
}

export default TodoHistory;

