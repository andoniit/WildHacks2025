import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserService, CycleService, CalendarService, AuthService } from '../services/api.service';
import './PeriodCalendar.css';
import Navbar from "../components/nav";

const MenstrualTimelinePage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('Period'); // Default category
  const [editingMode, setEditingMode] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [cycles, setCycles] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('cycleconnect_token');
    if (!token) {
      console.error('No token found in localStorage, redirecting to login');
      navigate('/login');
      return;
    }

    console.log('Token exists in localStorage:', token.substring(0, 10) + '...');

    // Fetch timeline data
    const fetchTimelineData = async () => {
      setIsLoading(true);
      try {
        // First try to verify token is valid
        await AuthService.verifyToken();
        
        // Fetch all required data in parallel
        const [timelineResponse, cyclesResponse, calendarResponse] = await Promise.all([
          UserService.getTimelineData(),
          CycleService.getAllCycles(),
          CalendarService.getCalendarEvents()
        ]);

        console.log('Timeline response:', timelineResponse?.data);
        
        setTimelineData(timelineResponse?.data?.data || {});
        setCycles(cyclesResponse?.data?.data || []);
        setCalendarEvents(calendarResponse?.data?.data || []);
      } catch (err) {
        console.error('Error fetching timeline data:', err);
        
        // If unauthorized, redirect to login
        if (err.response && err.response.status === 401) {
          console.error('Unauthorized access, redirecting to login');
          localStorage.removeItem('cycleconnect_token');
          navigate('/login');
          return;
        }
        
        setError('Failed to load timeline data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimelineData();
  }, [navigate]);

  useEffect(() => {
    // Load saved events from localStorage on mount
    const storedEvents = localStorage.getItem('events');
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    }
  }, []);

  // Save events to localStorage and sync with server
  const updateLocalStorage = (newEvents) => {
    localStorage.setItem('events', JSON.stringify(newEvents));
    syncEventsWithServer(newEvents);
  };

  // Function to sync events with the server
  const syncEventsWithServer = async (events) => {
    try {
      // Get the user's email from token (will be available in req.user on server)
      const token = localStorage.getItem('cycleconnect_token');
      if (!token) {
        console.error('Cannot sync with server: No authentication token found');
        return;
      }

      // Don't sync if there are no events
      if (!events || events.length === 0) {
        console.log('No events to sync with server');
        return;
      }

      console.log('Syncing events with server, count:', events.length);
      
      // Instead of syncing one by one, we'll send them all at once
      // Using the bulk update endpoint
      const calendarData = {
        calendarInfo: events.map(event => ({
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate),
          category: event.category,
          title: event.title || event.category, // Use title if available, otherwise use category
          note: event.note || ''
        }))
      };
      
      // Send all events in a bulk update
      await CalendarService.updateCalendarEvents(calendarData);
      
      console.log('Events successfully synced with server');
    } catch (error) {
      console.error('Error syncing events with server:', error);
      console.error('Error details:', error.response?.data);
      
      // Don't show an error to the user - this is a background sync
      // But log detailed error for debugging
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
    }
  };

  // Add a new event or update an existing one
  const addEvent = (e) => {
    e.preventDefault();
    if (editingMode && editingIndex !== null) {
      // Update the existing event (update timestamp as well)
      const updatedEvent = { 
        startDate, 
        endDate, 
        category,
        title: category, // Set title to same value as category
        note, 
        createdAt: Date.now() 
      };
      const updatedEvents = [...events];
      updatedEvents[editingIndex] = updatedEvent;
      setEvents(updatedEvents);
      updateLocalStorage(updatedEvents);
    } else {
      // Add a new event (with a timestamp)
      const newEvent = { 
        startDate, 
        endDate, 
        category,
        title: category, // Set title to same value as category
        note, 
        createdAt: Date.now() 
      };
      const updatedEvents = [...events, newEvent];
      setEvents(updatedEvents);
      updateLocalStorage(updatedEvents);
    }
    // Reset form and editing mode
    setIsModalOpen(false);
    setStartDate('');
    setEndDate('');
    setNote('');
    setCategory('Period');
    setEditingMode(false);
    setEditingIndex(null);
  };

  // Delete an event at given index
  const handleDelete = (index) => {
    const updatedEvents = events.filter((_, i) => i !== index);
    setEvents(updatedEvents);
    updateLocalStorage(updatedEvents);
  };

  // Open the modal in edit mode for a specific event (by index)
  const handleEdit = (index) => {
    const eventToEdit = events[index];
    setEditingMode(true);
    setEditingIndex(index);
    setStartDate(eventToEdit.startDate);
    setEndDate(eventToEdit.endDate);
    setNote(eventToEdit.note);
    setCategory(eventToEdit.category);
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

  // Render calendar cells for the current month (cells highlight if they fall within any event)
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

      // Check if this date falls within any saved event
      let event = events.find(event => {
        let start = new Date(event.startDate);
        let end = new Date(event.endDate);
        // Normalize times for comparison
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        dateObj.setHours(0, 0, 0, 0);
        return dateObj >= start && dateObj <= end;
      });

      calendarCells.push(
        <div
          key={dateString}
          className={`calendar-cell ${event ? 'active' : ''}`}
        >
          <div className="day-number">{day}</div>
        </div>
      );
    }
    return calendarCells;
  };

  // Weekday headers for the calendar
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Filter events to only display those for the current month (based on startDate)
  const filteredEvents = events.filter(event => {
    const eventStart = new Date(event.startDate);
    return eventStart.getMonth() === currentDate.getMonth() && eventStart.getFullYear() === currentDate.getFullYear();
  });

  // Compute predicted next event date based on the latest event in the current month
  let predictedDate = null;
  if (filteredEvents.length > 0) {
    const latestEvent = filteredEvents.reduce((acc, cur) =>
      new Date(cur.endDate) > new Date(acc.endDate) ? cur : acc
    );
    predictedDate = new Date(latestEvent.endDate);
    predictedDate.setDate(predictedDate.getDate() + 28);
  }

  if (isLoading) {
    return <div className="loading-container">Loading timeline data...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
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
            Add Event
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
          {/* Predicted next event section at the bottom of the calendar */}
          {predictedDate && (
            <div className="prediction-section">
              <p>
                Considering an avg 28 days event cycle, the predicted next event is:{' '}
                <span className="predicted-date">{predictedDate.toLocaleDateString()}</span>
              </p>
            </div>
          )}
        </div>
        <div className="calendar-right">
          <div className="note-section">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event, index) => (
                <div key={index} className="event-entry" style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                  <p className="note-message">Start Date: {event.startDate}</p>
                  <p className="note-message">Estimated End Date: {event.endDate}</p>
                  <p className="note-message">Category: {event.category}</p>
                  <p className="note-message">Note: {event.note}</p>
                  <p className="note-timestamp">Added on: {new Date(event.createdAt).toLocaleString()}</p>
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
              <p>No events added for this month</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal for adding or editing an event */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingMode ? 'Edit Event' : 'Add New Event'}</h2>
            <form onSubmit={addEvent}>
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
                <label>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="Period">Period</option>
                  <option value="Reminder">Reminder</option>
                  <option value="Others">Others</option>
                </select>
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
                <button type="submit">{editingMode ? 'Update Event' : 'Add Event'}</button>
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