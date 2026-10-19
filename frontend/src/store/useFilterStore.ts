import { create } from 'zustand';

interface FilterState {
  territorio: string;
  semana: string;
  semanaNumero: number;
  fechaTexto: string;
  regional: string;
  searchQuery: string;
  setTerritorio: (t: string) => void;
  setSemana: (s: string) => void;
  setRegional: (r: string) => void;
  setSearchQuery: (q: string) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  territorio: 'NORTE',
  semana: '20 - 26 May 2024',
  semanaNumero: 21,
  fechaTexto: 'Martes, 21 de mayo de 2024',
  regional: 'Atlántico',
  searchQuery: '',

  setTerritorio: (territorio) => set({ territorio }),
  setSemana: (semana) => set({ semana }),
  setRegional: (regional) => set({ regional }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
