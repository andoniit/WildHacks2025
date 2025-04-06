import React, { useState, useEffect } from 'react';
import './PeriodCalendar.css';
import Navbar from "../components/nav";

const MenstrualTimelinePage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [periods, setPeriods] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [note, setNote] = useState('');
  const [editingMode, setEditingMode] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  // Load saved periods from localStorage on mount
  useEffect(() => {
    const storedPeriods = localStorage.getItem('periods');
    if (storedPeriods) {
      setPeriods(JSON.parse(storedPeriods));
    }
  }, []);

  // Save periods to localStorage
  const updateLocalStorage = (newPeriods) => {
    localStorage.setItem('periods', JSON.stringify(newPeriods));
  };

  // Add a new period event or update an existing one
  const addPeriod = (e) => {
    e.preventDefault();
    if (editingMode && editingIndex !== null) {
      // Update the existing event (update timestamp as well)
      const updatedPeriod = { startDate, endDate, note, createdAt: Date.now() };
      const updatedPeriods = [...periods];
      updatedPeriods[editingIndex] = updatedPeriod;
      setPeriods(updatedPeriods);
      updateLocalStorage(updatedPeriods);
    } else {
      // Add a new event (with a timestamp)
      const newPeriod = { startDate, endDate, note, createdAt: Date.now() };
      const updatedPeriods = [...periods, newPeriod];
      setPeriods(updatedPeriods);
      updateLocalStorage(updatedPeriods);
    }
    // Reset form and editing mode
    setIsModalOpen(false);
    setStartDate('');
    setEndDate('');
    setNote('');
    setEditingMode(false);
    setEditingIndex(null);
  };

  // Delete an event at given index
  const handleDelete = (index) => {
    const updatedPeriods = periods.filter((_, i) => i !== index);
    setPeriods(updatedPeriods);
    updateLocalStorage(updatedPeriods);
  };

  // Open the modal in edit mode for a specific event (by index)
  const handleEdit = (index) => {
    const periodToEdit = periods[index];
    setEditingMode(true);
    setEditingIndex(index);
    setStartDate(periodToEdit.startDate);
    setEndDate(periodToEdit.endDate);
    setNote(periodToEdit.note);
    setIsModalOpen(true);
  };

  // Navigate to previous month
  const prevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  // Navigate to next month
  const nextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  // Render calendar cells for the current month (cells highlight if they fall within any period event)
  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayIndex = firstDay.getDay();
    const totalDays = lastDay.getDate();
    let calendarCells = [];

    // Empty cells for previous month days
    for (let i = 0; i < firstDayIndex; i++) {
      calendarCells.push(
        <div key={`empty-${i}`} className="calendar-cell empty"></div>
      );
    }

    // Cells for each day of the month
    for (let day = 1; day <= totalDays; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dateObj = new Date(dateString);

      // Check if this date falls within any saved period event
      let periodEvent = periods.find(period => {
        let start = new Date(period.startDate);
        let end = new Date(period.endDate);
        // Normalize times for comparison
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        dateObj.setHours(0, 0, 0, 0);
        return dateObj >= start && dateObj <= end;
      });

      calendarCells.push(
        <div
          key={dateString}
          className={`calendar-cell ${periodEvent ? 'active' : ''}`}
        >
          <div className="day-number">{day}</div>
        </div>
      );
    }
    return calendarCells;
  };

  // Weekday headers for the calendar
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Filter period events to only display those for the current month (based on startDate)
  const filteredPeriods = periods.filter(period => {
    const periodStart = new Date(period.startDate);
    return periodStart.getMonth() === currentDate.getMonth() && periodStart.getFullYear() === currentDate.getFullYear();
  });

  // Compute predicted next period date based on the latest event in the current month
  let predictedDate = null;
  if (filteredPeriods.length > 0) {
    const latestEvent = filteredPeriods.reduce((acc, cur) =>
      new Date(cur.endDate) > new Date(acc.endDate) ? cur : acc
    );
    predictedDate = new Date(latestEvent.endDate);
    predictedDate.setDate(predictedDate.getDate() + 28);
  }

  return (
    <>
    <Navbar/>
    <div className="period-calendar-container">
      <header className="calendar-header">
        <h1 className="month-display">
          {`${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}`}
        </h1>
        <div className="header-buttons">
          <button onClick={prevMonth}>&larr;</button>
          <button onClick={nextMonth}>&rarr;</button>
          <button onClick={() => { setIsModalOpen(true); setEditingMode(false); }}>
            Add Period
          </button>
        </div>
      </header>
      <div className="calendar-layout">
        <div className="calendar-left">
          <div className="calendar-grid">
            <div className="weekday-header">
              {weekdays.map((day, index) => (
                <div key={index} className="weekday">
                  {day}
                </div>
              ))}
            </div>
            <div className="days-grid">{renderCalendar()}</div>
          </div>
          {/* Predicted next period section at the bottom of the calendar */}
          {predictedDate && (
            <div className="prediction-section">
              <p>
                Considering an avg 28 days period cycle, the predicted next period is:{' '}
                <span className="predicted-date">{predictedDate.toLocaleDateString()}</span>
              </p>
            </div>
          )}
        </div>
        <div className="calendar-right">
          <div className="note-section">
            {filteredPeriods.length > 0 ? (
              filteredPeriods.map((period, index) => (
                <div key={index} className="period-entry" style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                  <p className="note-message">Start Date: {period.startDate}</p>
                  <p className="note-message">End Date: {period.endDate}</p>
                  <p className="note-message">Note: {period.note}</p>
                  <p className="note-timestamp">Added on: {new Date(period.createdAt).toLocaleString()}</p>
                  <div style={{ marginTop: '0.5rem' }}>
                    <button onClick={() => handleEdit(index)} style={{ marginRight: '10px', padding: '6px 10px', backgroundColor: '#fa9bc4', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(index)} style={{ padding: '6px 10px', backgroundColor: '#ed418b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No period added for this month</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal for adding or editing a period */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingMode ? 'Edit Period' : 'Add New Period'}</h2>
            <form onSubmit={addPeriod}>
              <div className="form-group">
                <label>First Day</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Day</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Note</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Enter note here"
                  required
                ></textarea>
              </div>
              <div className="form-buttons">
                <button type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit">{editingMode ? 'Update Period' : 'Add Period'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default MenstrualTimelinePage;