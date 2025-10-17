
import React, { useState, useEffect } from 'react';
import { Profile, Tempo } from '../types';
import { TrashIcon, ChevronUpIcon, ChevronDownIcon } from './icons';
import { TimeInput } from './TimeInput';

interface ProfileEditorProps {
  profileToEdit: Profile | null;
  onSave: (profile: Profile) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
}

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const colorToClass: { [key in Tempo['color']]: string } = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-400',
  red: 'bg-red-500',
};

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ profileToEdit, onSave, onCancel, onDelete }) => {
  const [name, setName] = useState('');
  const [tempos, setTempos] = useState<Tempo[]>([]);
  const [newTempoMinutes, setNewTempoMinutes] = useState(1);
  const [newTempoSeconds, setNewTempoSeconds] = useState(0);
  const [newTempoColor, setNewTempoColor] = useState<Tempo['color']>('yellow');

  useEffect(() => {
    if (profileToEdit) {
      setName(profileToEdit.name);
      setTempos(profileToEdit.tempos);
    }
  }, [profileToEdit]);

  const handleAddTempo = () => {
    const duration = newTempoMinutes * 60 + newTempoSeconds;
    if (duration > 0) {
      const newTempo: Tempo = { id: Date.now().toString(), duration, color: newTempoColor };
      setTempos([...tempos, newTempo]);
    }
  };

  const handleRemoveTempo = (id: string) => {
    setTempos(tempos.filter(tempo => tempo.id !== id));
  };
  
  const moveTempo = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === tempos.length - 1) return;
    
    const newTempos = [...tempos];
    const item = newTempos.splice(index, 1)[0];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    newTempos.splice(newIndex, 0, item);
    setTempos(newTempos);
  };

  const handleTempoColorChange = (id: string, color: Tempo['color']) => {
    setTempos(tempos.map(t => t.id === id ? { ...t, color } : t));
  };

  const handleSave = () => {
    if (name.trim() === '') {
      alert('Por favor, introduce un nombre para el perfil.');
      return;
    }
    const profile: Profile = {
      id: profileToEdit ? profileToEdit.id : Date.now().toString(),
      name: name.trim(),
      tempos,
    };
    onSave(profile);
  };

  return (
    <div className="p-4 min-h-screen max-w-lg mx-auto">
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500 mb-6 pb-1">
        {profileToEdit ? 'Editar Perfil' : 'Crear Perfil'}
      </h1>

      <div className="space-y-6">
        <div>
          <label htmlFor="profileName" className="block text-sm font-medium text-gray-400 mb-1">Nombre del Perfil</label>
          <input
            id="profileName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej., Yoga Matutino"
            className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Tempos</h2>
          <div className="space-y-2 bg-gray-900 border border-gray-800 p-2 rounded-lg">
            {tempos.length > 0 ? tempos.map((tempo, index) => (
              <div key={tempo.id} className="flex items-center justify-between bg-gray-800 p-2 rounded">
                <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${colorToClass[tempo.color]}`}></div>
                    <span className="font-mono text-lg">{formatTime(tempo.duration)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 border-r border-gray-700 pr-2 mr-1">
                      <button title="Intensidad Leve" onClick={() => handleTempoColorChange(tempo.id, 'green')} className={`w-5 h-5 rounded-full bg-green-500 transition-transform hover:scale-110 ${tempo.color === 'green' ? 'ring-2 ring-offset-1 ring-offset-gray-800 ring-white' : 'opacity-40'}`}></button>
                      <button title="Intensidad Normal" onClick={() => handleTempoColorChange(tempo.id, 'yellow')} className={`w-5 h-5 rounded-full bg-yellow-400 transition-transform hover:scale-110 ${tempo.color === 'yellow' ? 'ring-2 ring-offset-1 ring-offset-gray-800 ring-white' : 'opacity-40'}`}></button>
                      <button title="Intensidad Máxima" onClick={() => handleTempoColorChange(tempo.id, 'red')} className={`w-5 h-5 rounded-full bg-red-500 transition-transform hover:scale-110 ${tempo.color === 'red' ? 'ring-2 ring-offset-1 ring-offset-gray-800 ring-white' : 'opacity-40'}`}></button>
                  </div>
                  <button onClick={() => moveTempo(index, 'up')} className="p-1 rounded-full hover:bg-gray-700 disabled:opacity-30" disabled={index === 0}><ChevronUpIcon /></button>
                  <button onClick={() => moveTempo(index, 'down')} className="p-1 rounded-full hover:bg-gray-700 disabled:opacity-30" disabled={index === tempos.length - 1}><ChevronDownIcon /></button>
                  <button onClick={() => handleRemoveTempo(tempo.id)} className="text-red-500 p-1 rounded-full hover:bg-red-900/50">
                    <TrashIcon />
                  </button>
                </div>
              </div>
            )) : <p className="text-gray-500 text-center py-4">Añade tu primer tempo abajo.</p>}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg space-y-4">
          <h3 className="font-semibold text-center text-gray-300">Añadir Nuevo Tempo</h3>
          <div className="flex justify-center">
             <TimeInput 
                minutes={newTempoMinutes} 
                seconds={newTempoSeconds} 
                onMinutesChange={setNewTempoMinutes}
                onSecondsChange={setNewTempoSeconds}
              />
          </div>
          <div className="flex justify-center items-center space-x-4 pt-2">
            <span className="text-sm text-gray-400">Intensidad:</span>
            <button title="Leve" onClick={() => setNewTempoColor('green')} className={`w-7 h-7 rounded-full bg-green-500 transition-transform hover:scale-110 ${newTempoColor === 'green' ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-white' : ''}`}></button>
            <button title="Normal" onClick={() => setNewTempoColor('yellow')} className={`w-7 h-7 rounded-full bg-yellow-400 transition-transform hover:scale-110 ${newTempoColor === 'yellow' ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-white' : ''}`}></button>
            <button title="Máxima" onClick={() => setNewTempoColor('red')} className={`w-7 h-7 rounded-full bg-red-500 transition-transform hover:scale-110 ${newTempoColor === 'red' ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-white' : ''}`}></button>
          </div>
          <button onClick={handleAddTempo} className="w-full border border-amber-500 text-amber-500 font-bold py-2 px-4 rounded-md hover:bg-amber-500 hover:text-black transition-colors !mt-6">
            Añadir Tempo
          </button>
        </div>
      </div>
      
      <div className="mt-8 flex flex-col space-y-3">
        <button onClick={handleSave} className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-3 px-4 rounded-md hover:from-amber-400 hover:to-orange-500 transition-all">Guardar Perfil</button>
        <button onClick={onCancel} className="w-full bg-gray-700 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-600 transition-colors">Cancelar</button>
        {profileToEdit && (
            <button onClick={() => onDelete(profileToEdit.id)} className="w-full text-red-500 font-bold py-2 px-4 rounded-md mt-4 hover:bg-red-900/50 transition-colors">Eliminar Perfil</button>
        )}
      </div>
    </div>
  );
};
