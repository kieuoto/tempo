
import React, { useState, useEffect, useCallback } from 'react';
import { Profile, View, Tempo } from './types';
import { ProfileList } from './components/ProfileList';
import { ProfileEditor } from './components/ProfileEditor';
import { TimerRunner } from './components/TimerRunner';

// Custom hook for localStorage
function useLocalStorage<T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      let parsedItem = item ? JSON.parse(item) : initialValue;

      // One-time migration for profiles to add tempo colors
      if (key === 'tempoFlowProfiles' && Array.isArray(parsedItem)) {
        const profiles = parsedItem as Profile[];
        const needsMigration = profiles.some(p => p.tempos.some(t => (t as Tempo).color === undefined));
        
        if (needsMigration) {
            console.log("Migrating profiles to include tempo colors...");
            parsedItem = profiles.map(profile => ({
                ...profile,
                tempos: profile.tempos.map(tempo => ({
                    ...tempo,
                    color: (tempo as Tempo).color ?? 'yellow' // Add default color
                }))
            }));
        }
      }
      return parsedItem;

    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}


const App: React.FC = () => {
  const [profiles, setProfiles] = useLocalStorage<Profile[]>('tempoFlowProfiles', []);
  const [view, setView] = useState<View>('list');
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);

  const handleCreateProfile = () => {
    setActiveProfileId(null);
    setView('editor');
  };

  const handleEditProfile = (id: string) => {
    setActiveProfileId(id);
    setView('editor');
  };

  const handleStartProfile = (id: string) => {
    setActiveProfileId(id);
    setView('runner');
  };

  const handleSaveProfile = (profile: Profile) => {
    const existingIndex = profiles.findIndex(p => p.id === profile.id);
    if (existingIndex > -1) {
      const newProfiles = [...profiles];
      newProfiles[existingIndex] = profile;
      setProfiles(newProfiles);
    } else {
      setProfiles([...profiles, profile]);
    }
    setView('list');
  };
  
  const handleDeleteProfile = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este perfil?')) {
        setProfiles(profiles.filter(p => p.id !== id));
        setView('list');
    }
  }

  const handleExit = useCallback(() => {
    setActiveProfileId(null);
    setView('list');
  }, []);

  const renderView = () => {
    switch (view) {
      case 'editor':
        const profileToEdit = activeProfileId ? profiles.find(p => p.id === activeProfileId) || null : null;
        return <ProfileEditor 
            profileToEdit={profileToEdit} 
            onSave={handleSaveProfile} 
            onCancel={handleExit} 
            onDelete={handleDeleteProfile}
        />;
      case 'runner':
        const profileToRun = profiles.find(p => p.id === activeProfileId);
        if (!profileToRun || profileToRun.tempos.length === 0) {
            handleExit();
            alert("Este perfil no tiene tempos y no se puede iniciar.");
            return null;
        }
        return <TimerRunner profile={profileToRun} onExit={handleExit} />;
      case 'list':
      default:
        return (
          <ProfileList
            profiles={profiles}
            onStartProfile={handleStartProfile}
            onEditProfile={handleEditProfile}
            onCreateProfile={handleCreateProfile}
          />
        );
    }
  };

  return (
    <div className="bg-black min-h-screen font-sans">
      {renderView()}
    </div>
  );
};

export default App;
