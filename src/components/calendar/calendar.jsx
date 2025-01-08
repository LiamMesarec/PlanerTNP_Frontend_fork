import axios from 'axios';
import Cookie from "js-cookie";
import { useEffect, useRef, useState } from "react";
import '../../App.css';
import env from "../../env.json";
import './calendar.css';
import React from "react";
import TaskModal from "../taskModal";

function getStartOfWeek(date) {
    const dayOfWeek = date.getDay();
    const difference = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(date.setDate(difference));
}

function addDays(date, days) {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + days);
    return newDate;
}

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

const tmpdata = [
    { "task_name": "overflow: hidden;", "description": "neke neke", "color": '#e74c3c', "start_time": "2024-10-22T14:00:00", "end_time": "2024-10-22T16:00:00" },
    { "task_name": "task2", "description": "neke neke", "color": '#9b59b6', "start_time": "2024-10-22T14:00:00", "end_time": "2024-10-23T16:00:00" },
    { "task_name": "task3", "description": "neke neke", "color": "#2ecc71", "start_time": "2024-10-23T18:00:00", "end_time": "2024-10-24T20:00:00" },
    { "task_name": "task4", "description": "neke neke", "color": "#7f8c8d", "start_time": "2024-10-24T22:00:00", "end_time": "2024-10-25T23:00:00" }
];

function Calendar() {
    const [signedIn, setSignedIn] = useState(false);
    const [currentWeek, setCurrentWeek] = useState(getStartOfWeek(new Date()));
    const [tasks, setTasks] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [schedules, setSchedules] = useState([]);
    const fileInputRef = useRef(null);

    const [newTask, setNewTask] = useState({
        name: '',
        urgent: false,
        color: '#3498db', // Default color
        startDateTime: '', // This will be set dynamically when clicked on a time slot
        endDateTime: '',   // Default end time
    });
    const [selectedTask, setSelectedTask] = useState(null);

    const renderTaskInTimeSlot = (day, slot) => {
        const dayTasks = tasks.filter(task => {
            const taskStart = new Date(task.startDateTime);
            const taskEnd = new Date(task.endDateTime);
            const slotHour = parseInt(slot.split(":")[0]);
            const slotMinutes = parseInt(slot.split(":")[1]);

            const slotTime = new Date(day);
            slotTime.setHours(slotHour, slotMinutes, 0, 0);
            // Adjust to include entire range on the given day
            return (taskStart <= slotTime && taskEnd > slotTime);
        });

        return dayTasks.map((task, index) => (
            selectedFilter !== null && task.color !== filters[selectedFilter] ? null : (
                <p key={index} className="task-ribbon" style={{ backgroundColor: task.color }}>
                <b>{task.name}</b>
                </p>
            )
        ));
    };

    const handleFileImport = (event) => {
        const file = event.target.files[0];
        if (file && file.type === "application/json") {
            const reader = new FileReader();
            reader.onload = (e) => {
                const jsonData = JSON.parse(e.target.result);
                setTasks(prevTasks => [...prevTasks, jsonData]);
                console.log(jsonData);
            };
            reader.readAsText(file);
        } else {
            alert("Please select a valid JSON file.");
        }
    };

    const handleEditTask = (task) => {
        console.log("Edit task:", task);
        setSelectedTask(task);
        setShowModal(true);
    };

    const handleDeleteTask = (taskId) => {
        // Add logic to delete the task
        setTasks((prevTasks) => prevTasks.filter(task => task._id !== taskId));
        console.log("Deleted task with ID:", taskId);
    };

    useEffect(() => {
        if (Cookie.get("signed_in_user") !== undefined) {
            const user = JSON.parse(Cookie.get("signed_in_user"));
            setSignedIn(user);

            // Fetch tasks and schedules in parallel
            Promise.all([
                axios.get(`${env.api}/task/user/${user._id}/tasks`),
                        axios.get(`${env.api}/schedule/schedules/all`)
            ])
            .then(([taskResponse, scheduleResponse]) => {
                const userTasks = taskResponse.data.tasks;
                const schedules = scheduleResponse.data.tasks;  // Assuming schedules are in 'tasks'

                // Map over schedules to match task properties
            const formattedSchedules = schedules.map(schedule => ({
                _id: user._id,
                name: schedule.name,
                color: schedule.color,
                startDateTime: schedule.start_time,  // Rename to match tasks' format
                endDateTime: schedule.end_time       // Rename to match tasks' format
            }));

            // Combine user tasks and formatted schedules into a single array
            const combinedTasks = [...userTasks, ...formattedSchedules];
            setTasks(combinedTasks);

            // Log the combined tasks array
            console.log("Fetched and combined tasks:", combinedTasks);
            })
            .catch((error) => {
                console.error("Error fetching tasks or schedules:", error);
            });
        } else {
            setSignedIn(false);
        }
    }, []);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
        weekDays.push(addDays(currentWeek, i));
    }

    const timeSlots = [];
    for (let i = 0; i < 24 * 2; i++) {
        const hours = Math.floor(i / 2);
        const minutes = i % 2 === 0 ? "00" : "30";
        timeSlots.push(`${hours.toString().padStart(2, '0')}:${minutes}`);
    }

    const handlePrevWeek = () => {
        setCurrentWeek(addDays(currentWeek, -7));
    };

    const handleNextWeek = () => {
        setCurrentWeek(addDays(currentWeek, 7));
    };

    const handleTimeSlotClick = (day, slot) => {
        const clickedTime = new Date(day);
        const [hour, minute] = slot.split(":");
        clickedTime.setHours(hour, minute);

        // Check if there's an existing task at the clicked time slot
        const taskAtSlot = tasks.find(task => {
            const taskStart = new Date(task.startDateTime);
            const taskEnd = new Date(task.endDateTime);
            return taskStart <= clickedTime && taskEnd > clickedTime;
        });

        if (taskAtSlot) {
            // If a task exists at the selected time, open the modal in edit mode
            handleEditTask(taskAtSlot);
        } else {
            // Otherwise, create a new task at the selected time
            setNewTask({
                ...newTask,
                startDateTime: clickedTime.toISOString().slice(0, 16),
                       endDateTime: new Date(clickedTime.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16), // Default end time
            });
            setShowModal(true); // Show the modal for creating a new task
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setNewTask({
            name: '',
            urgent: false,
            color: '#3498db',
            startDateTime: '',
            endDateTime: '',
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
        const taskData = {
            name: newTask.name,
            urgent: newTask.urgent,
            color: newTask.color,
            startDateTime: newTask.startDateTime,
            endDateTime: newTask.endDateTime,
        };

        if (selectedTask) {
            // Edit existing task
            axios.put(`${env.api}/task/user/${user._id}/tasks/${selectedTask._id}`, taskData, {
                headers: { 'Content-Type': 'application/json' },
            }).then(() => {
                setShowModal(false);
                setSelectedTask(null); // Reset selected task after saving
            }).catch((error) => console.log(error));
        } else {
            // Add new task
            axios.post(`${env.api}/task/user/${user._id}/tasks`, taskData, {
                headers: { 'Content-Type': 'application/json' },
            }).then(() => {
                setShowModal(false);
            }).catch((error) => console.log(error));
        }
    };


    const filteredTasks = tasks.filter(task => {
        const startDate = new Date(task.startDateTime);
        const endDate = new Date(task.endDateTime);

        return weekDays.some(day => (
            (startDate <= day && endDate >= day) // Checks if the task spans across the week
        ));
    });

    return (
        <div className="calendar-container">
        <div className="calendar-header">
        <button className="change-week" onClick={handlePrevWeek}>←</button>
        <h2>Week of {currentWeek.toDateString()}</h2>
        <button className="change-week" onClick={handleNextWeek}>→</button>
        </div>
        <div className="filters">
        <div>Filter:</div>
        {filters.map((filter, index) => (
            <div
            key={index}
            onClick={() => setSelectedFilter(index)}
            className={`${selectedFilter === index ? 'active-filter' : 'filter'}`}
            style={{ backgroundColor: filter }}
            >
            ⠀
            </div>
        ))}
        <div className="clear-filter" onClick={() => setSelectedFilter(null)}>Clear</div>
        </div>
        <div className="calendar-grid-wrapper">
        <div className="time-label-column">
        {timeSlots.map((slot, slotIndex) => (
            <div key={slotIndex} className="time-label">{slot}</div>
        ))}
        </div>
        <div className="calendar-grid">
        {weekDays.map((day, index) => (
            <div key={index}>
            <h3>{day.toDateString()}</h3>
            <div className="calendar-day">
            <div className="time-slots">
            {timeSlots.map((slot, slotIndex) => (
                <div key={slotIndex} className="time-slot" onClick={() => handleTimeSlotClick(day, slot)}>
                <div className="content-area">
                {renderTaskInTimeSlot(day, slot)}
                </div>
                </div>
            ))}
            </div>
            </div>
            </div>
        ))}
        </div>
        </div>
        {signedIn !== false ? (
            <div className="import-data">
            <span>Import your own schedule: </span>
            <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleFileImport}
            />
            </div>) : null
        }

        {showModal && (
            <TaskModal
            task={selectedTask || newTask} // Pass the selected task or new task details
            filters={filters}
            onSave={handleSubmit}
            onClose={() => setShowModal(false)}
            onInputChange={handleInputChange}
            checked={selectedTask ? selectedTask.urgent : newTask.urgent} // Set urgency status
            />

        )}
        </div>
    );
}

export default Calendar;
