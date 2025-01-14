import React, { useState, useEffect } from "react";
import "./calendar.css";


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
  "#1abc9c",
  "#2ecc71",
  "#3498db",
  "#9b59b6",
  "#f1c40f",
  "#e67e22",
  "#e74c3c",
  "#34495e",
  "#95a5a6",
  "#7f8c8d",
];

function Calendar() {
  const [currentWeek, setCurrentWeek] = useState(getStartOfWeek(new Date()));
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem("tasks")) || []);
  const [aiInput, setAiInput] = useState("");
  const [selectedFilter, setSelectedFilter] = useState(null);

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    weekDays.push(addDays(currentWeek, i));
  }

  const timeSlots = [];
  for (let i = 0; i < 24 * 2; i++) {
    const hours = Math.floor(i / 2);
    const minutes = i % 2 === 0 ? "00" : "30";
    timeSlots.push(`${hours.toString().padStart(2, "0")}:${minutes}`);
  }

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handlePrevWeek = () => setCurrentWeek(addDays(currentWeek, -7));
  const handleNextWeek = () => setCurrentWeek(addDays(currentWeek, 7));

  const handleAiEventCreation = () => {
    if (!aiInput) {
      return alert("Prosim vnesite opis dogodka.");
    }

    try {
      const dayRegex = /(ponedeljek|torek|sreda|\u010detrtek|petek|sobota|nedelja)/i;
      const timeRegex = /ob\s(\d{1,2}:\d{2})/;
      const descriptionRegex = /^(.*?)\s(v\s|ob\s)/;

      const dayMatch = aiInput.match(dayRegex);
      const timeMatch = aiInput.match(timeRegex);
      const descriptionMatch = aiInput.match(descriptionRegex);

      if (!dayMatch || !timeMatch || !descriptionMatch) {
        throw new Error("Ne morem razbrati vnosa. Poskusi z obliko: 'Sestanek v torek ob 14:00'");
      }

      const day = dayMatch[1].toLowerCase();
      const time = timeMatch[1];
      const description = descriptionMatch[1];

      const daysOfWeek = [
        "ponedeljek",
        "torek",
        "sreda",
        "\u010detrtek",
        "petek",
        "sobota",
        "nedelja",
      ];
      const dayIndex = daysOfWeek.indexOf(day);

      if (dayIndex === -1) {
        throw new Error("Dan ni veljaven.");
      }

      const eventDate = new Date(currentWeek);
      eventDate.setDate(currentWeek.getDate() + dayIndex);
      const [hours, minutes] = time.split(":");
      eventDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const newEvent = {
        name: description.trim(),
        description: `Dogodek: ${description.trim()}`,
        startDateTime: eventDate.toISOString(),
        color: filters[selectedFilter] || "#3498db", // Uporabi izbrano barvo
      };

      setTasks([...tasks, newEvent]);
      setAiInput("");
      alert("Dogodek uspe\u0161no dodan!");
    } catch (error) {
      console.error("Napaka pri ustvarjanju dogodka:", error);
      alert(error.message);
    }
  };

  const handleTaskDelete = (taskToDelete) => {
    const confirmed = window.confirm(`Ali ste prepri\u010dani, da \u017eelite izbrisati dogodek \"${taskToDelete.name}\"?`);
    if (confirmed) {
      const updatedTasks = tasks.filter((task) => task !== taskToDelete);
      setTasks(updatedTasks);
      alert(`Dogodek \"${taskToDelete.name}\" je bil izbrisan.`);
    }
  };

  const renderTaskInTimeSlot = (day, slot) => {
    const slotTime = new Date(day);
    const [hours, minutes] = slot.split(":");
    slotTime.setHours(hours, minutes, 0, 0);

    return tasks
      .filter((task) => new Date(task.startDateTime).getTime() === slotTime.getTime())
      .map((task, index) => (
        <div
          key={index}
          className="task-ribbon"
          style={{ backgroundColor: task.color }}
          onClick={() => handleTaskDelete(task)}
        >
          <b>{task.name}</b>
        </div>
      ));
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={handlePrevWeek} className="change-week">&larr;</button>
        <h2>Week of {currentWeek.toDateString()}</h2>
        <button onClick={handleNextWeek} className="change-week">&rarr;</button>
      </div>

      <div className="filters">
        <div>Izberi barvo za dogodek:</div>
        {filters.map((filter, index) => (
          <div
            key={index}
            onClick={() => setSelectedFilter(index)}
            className={`${selectedFilter === index ? 'active-filter' : 'filter'}`}
            style={{ backgroundColor: filter }}
          >
            &nbsp;
          </div>
        ))}
        <div className="clear-filter" onClick={() => setSelectedFilter(null)}>Clear</div>
      </div>

      <div className="ai-event-creator">
        <input
          type="text"
          placeholder="Vnesi dogodek (npr. 'Sestanek v pon ob 14h')"
          value={aiInput}
          onChange={(e) => setAiInput(e.target.value)}
          className="ai-input"
        />
        <button onClick={handleAiEventCreation} className="ai-create-btn">Ustvari dogodek</button>
      </div>

      <div className="calendar-grid-wrapper">
        <div className="time-label-column">
          {timeSlots.map((slot, index) => (
            <div key={index} className="time-label">
              {slot}
            </div>
          ))}
        </div>
        <div className="calendar-grid">
          {weekDays.map((day, index) => (
            <div key={index} className="day-column">
              <h3 className="day-header">{day.toDateString()}</h3>
              <div className="calendar-day">
                {timeSlots.map((slot, slotIndex) => (
                  <div key={slotIndex} className="time-slot">
                    {renderTaskInTimeSlot(day, slot)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Calendar;
