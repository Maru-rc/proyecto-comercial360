import { useQuery } from "@tanstack/react-query";
import { getVisitsMap } from "../api/visitas";
import { IVisitMapStopContract } from "../types/visita";

export const useVisitasMap = (date?: string, advisorId?: number) => {
  const query = useQuery<IVisitMapStopContract[]>({
    queryKey: ["visits", "map", date, advisorId],
    queryFn: () => getVisitsMap(date, advisorId),
    staleTime: 1000 * 60 * 5,
  });

  return {
    mapStops: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
