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
      visitId?: number;
    }) =>
      registrarVisita(
        variables.data,
        variables.fotos,
        variables.docs,
        variables.visitId,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
      queryClient.invalidateQueries({ queryKey: ['seguimiento'] });
      queryClient.invalidateQueries({ queryKey: ['agenda'] });
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
  });

  return {
    registrarVisita: registrarVisitaMutation.mutateAsync,
    isSubmitting: registrarVisitaMutation.isPending,
  };
};
