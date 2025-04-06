/**
 * Date utility functions for cycle calculations and predictions
 */

/**
 * Calculate the number of days between two dates
 * @param {Date} startDate - Starting date
 * @param {Date} endDate - Ending date
 * @returns {Number} - Number of days between dates
 */
const daysBetweenDates = (startDate, endDate) => {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = Math.round(Math.abs((start - end) / oneDay));
  return diffDays;
};

/**
 * Calculate the next expected cycle start date
 * @param {Date} lastCycleStartDate - Last cycle start date
 * @param {Number} avgCycleLength - Average cycle length in days
 * @returns {Date} - Next expected cycle start date
 */
const predictNextCycleStartDate = (lastCycleStartDate, avgCycleLength) => {
  const lastStart = new Date(lastCycleStartDate);
  const nextStart = new Date(lastStart);
  nextStart.setDate(lastStart.getDate() + avgCycleLength);
  return nextStart;
};

/**
 * Determine the current phase of the menstrual cycle
 * @param {Date} lastCycleStartDate - Last cycle start date
 * @param {Number} avgCycleLength - Average cycle length in days
 * @param {Number} avgPeriodLength - Average period length in days
 * @returns {Object} - Current phase and days into that phase
 */
const determineCyclePhase = (lastCycleStartDate, avgCycleLength, avgPeriodLength = 5) => {
  const today = new Date();
  const lastStart = new Date(lastCycleStartDate);
  const daysSinceStart = daysBetweenDates(lastStart, today);
  
  // Default values for cycle phases (can be adjusted)
  const follicularPhaseEnd = avgPeriodLength + 7; // Period + early follicular
  const ovulationPhaseStart = avgCycleLength - 16;
  const ovulationPhaseEnd = avgCycleLength - 12;
  const lutealPhaseStart = ovulationPhaseEnd + 1;
  
  // Determine current phase
  let currentPhase;
  let daysIntoPhase;
  
  if (daysSinceStart <= avgPeriodLength) {
    currentPhase = 'menstrual';
    daysIntoPhase = daysSinceStart;
  } else if (daysSinceStart <= follicularPhaseEnd) {
    currentPhase = 'follicular';
    daysIntoPhase = daysSinceStart - avgPeriodLength;
  } else if (daysSinceStart >= ovulationPhaseStart && daysSinceStart <= ovulationPhaseEnd) {
    currentPhase = 'ovulation';
    daysIntoPhase = daysSinceStart - ovulationPhaseStart;
  } else {
    currentPhase = 'luteal';
    daysIntoPhase = daysSinceStart - lutealPhaseStart;
  }
  
  return {
    phase: currentPhase,
    daysIntoPhase: daysIntoPhase,
    totalDaysInCycle: daysSinceStart
  };
};

/**
 * Format a date to YYYY-MM-DD string
 * @param {Date} date - Date to format
 * @returns {String} - Formatted date string
 */
const formatDate = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

module.exports = {
  daysBetweenDates,
  predictNextCycleStartDate,
  determineCyclePhase,
  formatDate
};
