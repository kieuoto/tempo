import React from 'react';

interface TimeInputProps {
  minutes: number;
  seconds: number;
  onMinutesChange: (value: number) => void;
  onSecondsChange: (value: number) => void;
}

export const TimeInput: React.FC<TimeInputProps> = ({ minutes, seconds, onMinutesChange, onSecondsChange }) => {
  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0 && value < 100) {
      onMinutesChange(value);
    } else if (e.target.value === '') {
      onMinutesChange(0);
    }
  };

  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0 && value < 60) {
      onSecondsChange(value);
    } else if (e.target.value === '') {
      onSecondsChange(0);
    }
  };

  return (
    <div className="flex items-center justify-center space-x-2 bg-gray-900/50 border border-gray-700 p-3 rounded-md">
      <input
        type="number"
        value={String(minutes).padStart(2, '0')}
        onChange={handleMinutesChange}
        className="w-20 bg-transparent text-center text-3xl font-mono text-gray-100 focus:outline-none"
        min="0"
        max="99"
      />
      <span className="text-3xl font-mono text-amber-500 pb-1">:</span>
      <input
        type="number"
        value={String(seconds).padStart(2, '0')}
        onChange={handleSecondsChange}
        className="w-20 bg-transparent text-center text-3xl font-mono text-gray-100 focus:outline-none"
        min="0"
        max="59"
      />
    </div>
  );
};