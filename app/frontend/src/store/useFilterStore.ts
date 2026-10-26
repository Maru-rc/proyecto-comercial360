import { create } from 'zustand';
import { isoWeek } from '../lib/semana';

interface FilterState {
  territorio: string;
  semanaNumero: number;
  regional: string;
  searchQuery: string;
  setTerritorio: (t: string) => void;
  setSemanaNumero: (s: number) => void;
  setRegional: (r: string) => void;
  setSearchQuery: (q: string) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  territorio: 'Todos',
  semanaNumero: isoWeek(new Date()),
  regional: 'Atlántico',
  searchQuery: '',

  setTerritorio: (territorio) => set({ territorio }),
  setSemanaNumero: (semanaNumero) => set({ semanaNumero }),
  setRegional: (regional) => set({ regional }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
