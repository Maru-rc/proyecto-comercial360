import { useQuery } from '@tanstack/react-query';
import {
  getDashboardKpis,
  getSeguimientoVisitas,
  getAgendaDelDia,
} from '../api/kpis';
import { useFilterStore } from '../store/useFilterStore';

export const useDashboardKpis = () => {
  const { territorio, semanaNumero } = useFilterStore();

  const kpisQuery = useQuery({
    queryKey: ['kpis', territorio, semanaNumero],
    queryFn: () => getDashboardKpis(territorio, semanaNumero),
    staleTime: 1000 * 60 * 5,
  });

  const seguimientoQuery = useQuery({
    queryKey: ['seguimiento', territorio, semanaNumero],
    queryFn: () => getSeguimientoVisitas(),
    staleTime: 1000 * 60 * 5,
  });

  const agendaQuery = useQuery({
    queryKey: ['agenda', territorio],
    queryFn: () => getAgendaDelDia(),
    staleTime: 1000 * 60 * 5,
  });

  return {
    kpis: kpisQuery.data,
    isLoadingKpis: kpisQuery.isLoading,
    isErrorKpis: kpisQuery.isError,
    filasSeguimiento: seguimientoQuery.data || [],
    isLoadingSeguimiento: seguimientoQuery.isLoading,
    agendaItems: agendaQuery.data || [],
    isLoadingAgenda: agendaQuery.isLoading,
  };
};
