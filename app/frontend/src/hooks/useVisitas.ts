import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registrarVisita } from '../api/visitas';
import { IVisitaRegistroFormData } from '../types/visita';

export const useVisitas = () => {
  const queryClient = useQueryClient();

  const registrarVisitaMutation = useMutation({
    mutationFn: (variables: {
      data: IVisitaRegistroFormData;
      fotos: string[];
      docs: string[];
    }) => registrarVisita(variables.data, variables.fotos, variables.docs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
      queryClient.invalidateQueries({ queryKey: ['seguimiento'] });
      queryClient.invalidateQueries({ queryKey: ['agenda'] });
    },
  });

  return {
    registrarVisita: registrarVisitaMutation.mutateAsync,
    isSubmitting: registrarVisitaMutation.isPending,
  };
};
