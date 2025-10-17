import React from 'react';
import { Profile } from '../types';
import { PlayIcon, EditIcon, PlusIcon } from './icons';

interface ProfileListProps {
  profiles: Profile[];
  onStartProfile: (id: string) => void;
  onEditProfile: (id: string) => void;
  onCreateProfile: () => void;
}

export const ProfileList: React.FC<ProfileListProps> = ({ profiles, onStartProfile, onEditProfile, onCreateProfile }) => {
  return (
    <div className="p-4 min-h-screen max-w-lg mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500 pb-2">TempoFlow</h1>
        <p className="text-gray-500">Tu Temporizador de Rutinas Personal</p>
      </header>
      
      <main className="space-y-4">
        {profiles.length === 0 ? (
          <div className="text-center py-16 px-4 bg-gray-900/50 border border-gray-800 rounded-lg">
            <p className="text-gray-500">Aún no hay perfiles.</p>
            <p className="text-gray-500">¡Toca el botón '+' para crear tu primera rutina!</p>
          </div>
        ) : (
          profiles.map(profile => (
            <div key={profile.id} className="bg-gray-900 border border-gray-800 p-4 rounded-lg flex items-center justify-between shadow-lg transition-all duration-300 hover:border-amber-500/50">
              <div>
                <h2 className="text-xl font-semibold text-gray-100">{profile.name}</h2>
                <p className="text-sm text-gray-500">{profile.tempos.length} tempo{profile.tempos.length !== 1 && 's'}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => onEditProfile(profile.id)} className="p-2 rounded-full text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
                  <EditIcon />
                </button>
                <button onClick={() => onStartProfile(profile.id)} className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-full hover:from-amber-400 hover:to-orange-500 transition-all active:scale-95">
                  <PlayIcon />
                </button>
              </div>
            </div>
          ))
        )}
      </main>

      <button
        onClick={onCreateProfile}
        className="fixed bottom-8 right-8 bg-gradient-to-br from-amber-500 to-orange-600 text-white p-4 rounded-full shadow-lg shadow-orange-500/30 hover:shadow-orange-400/50 transition-all active:scale-95 transform hover:-translate-y-1"
        aria-label="Crear Nuevo Perfil"
      >
        <PlusIcon />
      </button>
    </div>
  );
};