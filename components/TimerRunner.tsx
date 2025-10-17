import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Profile, Tempo } from '../types';
import { PlayIcon, PauseIcon, RestartIcon, ExitIcon } from './icons';

interface TimerRunnerProps {
  profile: Profile;
  onExit: () => void;
}

const formatTimeForDisplay = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const ALARM_URL = 'https://storage.googleapis.com/tfjs-models/demos/rps/sounds/bell.mp3';

const colorStyles: { [key in Tempo['color']]: { text: string; bg: string; textClass: string } } = {
  green: {
    text: 'from-green-400 to-emerald-500',
    bg: 'bg-gradient-to-br from-gray-900 via-black to-green-900/60',
    textClass: 'text-green-400',
  },
  yellow: {
    text: 'from-amber-400 to-orange-500',
    bg: 'bg-black',
    textClass: 'text-yellow-400',
  },
  red: {
    text: 'from-red-500 to-rose-600',
    bg: 'bg-gradient-to-br from-gray-900 via-black to-red-900/60',
    textClass: 'text-red-500',
  },
};

export const TimerRunner: React.FC<TimerRunnerProps> = ({ profile, onExit }) => {
  const [currentTempoIndex, setCurrentTempoIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(profile.tempos[0]?.duration ?? 0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  
  const intervalRef = useRef<number | null>(null);
  const stopwatchRef = useRef<number | null>(null);
  const alarmRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlocked = useRef(false);

  const totalTime = useMemo(() => profile.tempos.reduce((sum, tempo) => sum + tempo.duration, 0), [profile.tempos]);

  useEffect(() => {
    alarmRef.current = new Audio(ALARM_URL);
  }, []);

  const playAlarm = useCallback(() => {
    if (alarmRef.current) {
      const alarm = alarmRef.current;
      alarm.currentTime = 0;
      alarm.play().catch(e => console.error("Error playing sound:", e));
      setTimeout(() => {
        if (!alarm.paused) {
          alarm.pause();
          alarm.currentTime = 0;
        }
      }, 5000);
    }
  }, []);

  const advanceTempo = useCallback(() => {
    playAlarm();
    if (currentTempoIndex < profile.tempos.length - 1) {
      setCurrentTempoIndex(prev => prev + 1);
    } else {
      setIsComplete(true);
      setIsPaused(true);
    }
  }, [currentTempoIndex, profile.tempos.length, playAlarm]);

  useEffect(() => {
    setTimeLeft(profile.tempos[currentTempoIndex]?.duration ?? 0);
  }, [currentTempoIndex, profile.tempos]);

  useEffect(() => {
    if (isPaused || isComplete) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (stopwatchRef.current) clearInterval(stopwatchRef.current);
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          advanceTempo();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    stopwatchRef.current = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (stopwatchRef.current) clearInterval(stopwatchRef.current);
    };
  }, [isPaused, isComplete, advanceTempo]);

  const handleRestart = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (stopwatchRef.current) clearInterval(stopwatchRef.current);
    setCurrentTempoIndex(0);
    setTimeLeft(profile.tempos[0]?.duration ?? 0);
    setElapsedTime(0);
    setIsPaused(true);
    setIsComplete(false);
  };
  
  const handleTogglePause = () => {
    if (isComplete) return;

    if (!audioUnlocked.current && alarmRef.current) {
        alarmRef.current.play().then(() => {
            alarmRef.current?.pause();
            alarmRef.current!.currentTime = 0;
        }).catch(e => {
            console.error("Could not unlock audio context:", e);
        });
        audioUnlocked.current = true;
    }

    setIsPaused(prev => !prev);
  }

  const tempoColor = profile.tempos[currentTempoIndex]?.color ?? 'yellow';
  const currentStyles = colorStyles[tempoColor];

  return (
    <div className={`fixed inset-0 text-white flex flex-col items-center justify-between p-4 sm:p-8 transition-all duration-1000 ${isComplete ? colorStyles.green.bg : currentStyles.bg}`}>
      <header className="text-center w-full max-w-xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-200 truncate">{profile.name}</h1>
        {!isComplete && (
            <p className="text-xl sm:text-2xl text-white opacity-80 mt-1">Tempo {currentTempoIndex + 1} de {profile.tempos.length}</p>
        )}
        
        <div className="my-4 max-w-full overflow-x-auto p-2 rounded-lg bg-black/20 flex justify-center" style={{'scrollbarWidth': 'none'}}>
            <div className="inline-grid grid-flow-col auto-cols-max grid-rows-4 gap-x-6 gap-y-2">
                {profile.tempos.map((tempo, index) => {
                    const isCompleted = index < currentTempoIndex;
                    const isActive = index === currentTempoIndex;
                    const colorClass = colorStyles[tempo.color].textClass;

                    return (
                        <div 
                            key={tempo.id} 
                            className={`
                                font-mono text-4xl transition-all duration-300 ${colorClass}
                                ${isCompleted ? 'opacity-30 line-through' : 'opacity-90'}
                                ${isActive ? `font-bold scale-110 opacity-100` : ''}
                            `}
                        >
                            {formatTimeForDisplay(tempo.duration)}
                        </div>
                    );
                })}
            </div>
        </div>
      </header>
      
      <main className="flex-grow flex items-center justify-center">
        {isComplete ? (
          <div className="text-center">
            <h2 className={`text-5xl sm:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-br ${colorStyles.green.text}`}>¡Rutina Completada!</h2>
          </div>
        ) : (
          <div className="text-center">
            <div className="inline-flex flex-col items-center">
                <div className={`font-mono text-8xl sm:text-9xl md:text-[12rem] tracking-tighter font-extrabold bg-clip-text text-transparent bg-gradient-to-br ${currentStyles.text}`}>
                    {formatTimeForDisplay(timeLeft)}
                </div>
                <div className="w-full flex justify-between items-baseline font-mono -mt-2 sm:-mt-4 md:-mt-6 px-2">
                    <span className="text-5xl sm:text-6xl font-bold text-white">{formatTimeForDisplay(elapsedTime)}</span>
                    <span className="text-2xl sm:text-3xl text-white font-bold">Total: {formatTimeForDisplay(totalTime)}</span>
                </div>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full max-w-sm flex justify-around items-center">
        <button onClick={handleRestart} className="p-4 rounded-full text-gray-500 hover:text-white transition-colors disabled:opacity-30" title="Reiniciar" disabled={isComplete}>
          <RestartIcon />
        </button>
        <button 
          onClick={handleTogglePause} 
          className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-6 rounded-full shadow-lg shadow-orange-500/40 hover:shadow-orange-400/60 transition-all active:scale-95 transform hover:-translate-y-1 disabled:bg-image-none disabled:bg-gray-700 disabled:shadow-none disabled:translate-y-0"
          title={isPaused ? "Reanudar" : "Pausar"}
          disabled={isComplete}
        >
          {isPaused && !isComplete ? <PlayIcon /> : <PauseIcon />}
        </button>
        <button onClick={onExit} className="p-4 rounded-full text-gray-500 hover:text-white transition-colors" title="Salir">
          <ExitIcon />
        </button>
      </footer>
    </div>
  );
};