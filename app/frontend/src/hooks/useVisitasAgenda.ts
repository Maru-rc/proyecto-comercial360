import { useQuery } from "@tanstack/react-query";
import { getVisitsAgenda } from "../api/visitas";
import { IVisitAgendaItemContract } from "../types/visita";

export const useVisitasAgenda = (date?: string, advisorId?: number) => {
  const query = useQuery<IVisitAgendaItemContract[]>({
    queryKey: ["visits", "agenda", date, advisorId],
    queryFn: () => getVisitsAgenda(date, advisorId),
    staleTime: 1000 * 60 * 5,
  });

  return {
    agenda: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
