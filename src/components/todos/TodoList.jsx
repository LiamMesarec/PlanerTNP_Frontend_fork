import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookie from "js-cookie";
import env from "../../env.json";
import './todoList.css';
import TaskModal from '../taskModal'; // Import the Modal component

function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const currentDate = new Date();
  const currentDateTimeString = currentDate.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:MM

  // Set the end time to the next day's midnight (next 00:00)
  const midnight = new Date();
  midnight.setHours(23, 59, 59, 999); // set to end of the current day
  const midnightTimeString = midnight.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:MM


  const [newTask, setNewTask] = useState({
    name: '',
    urgent: false,
    color: '#3498db', // Default color
    startDateTime: currentDateTimeString, // Default to current time
    endDateTime: midnightTimeString,   // Default to midnight
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
    axios.get(`${env.api}/task/user/${user._id}/tasks`)
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
      startDateTime: currentDateTimeString, // Reset to current time
      endDateTime: midnightTimeString,   // Reset to midnight
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
    axios.post(`${env.api}/task/user/${user._id}/tasks`, newTask, {
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

  const renderTasks = () => {
    // Filter tasks that are not expired (i.e., where endDateTime is not before the current date)
    const activeTasks = tasks.filter(task => new Date(task.endDateTime) >= currentDate);

    return activeTasks.map((task, index) => (
      <li key={index} className="task-item">
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
          <button
            className="delete-button"
            style={{ marginLeft: "15px", backgroundColor: "cornflowerblue" }}
            onClick={() => handleEditTask(task)}
          >
            Edit
          </button>
          <button
            className="delete-button"
            style={{ marginLeft: "15px" }}
            onClick={() => handleDeleteTask(task._id)}
          >
            Delete
          </button>
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

export default TodoList;

