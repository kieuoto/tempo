
export interface Tempo {
  id: string;
  duration: number; // in seconds
  color: 'green' | 'yellow' | 'red';
}

export interface Profile {
  id: string;
  name: string;
  tempos: Tempo[];
}

export type View = 'list' | 'editor' | 'runner';
