import React from 'react';
import './taskModal.css';

function TaskModal({ task, filters, onClose, onSave, onInputChange }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{task._id ? 'Edit Task' : 'Add New Task'}</h2>
        <form onSubmit={onSave}>
          <div className="form-group">
            <label htmlFor="taskName">Task Name:</label>
            <input
              type="text"
              id="taskName"
              name="name"
              value={task.name}
              onChange={onInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Select Color:</label>
            <div className="color-options">
              {filters.map((color, index) => (
                <div
                  key={index}
                  className={`color-circle ${task.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => onInputChange({ target: { name: 'color', value: color } })}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="startDateTime">Start Date and Time:</label>
            <input
              type="datetime-local"
              id="startDateTime"
              name="startDateTime"
              value={task.startDateTime}
              onChange={onInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDateTime">End Date and Time:</label>
            <input
              type="datetime-local"
              id="endDateTime"
              name="endDateTime"
              value={task.endDateTime}
              onChange={onInputChange}
              required
              min={task.startDateTime}
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="urgent"
                checked={task.urgent}
                onChange={onInputChange}
              />
              Mark as urgent
            </label>
          </div>

          <div className="modal-buttons">
            <button type="submit" className="submit-button">Save Task</button>
            <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;

