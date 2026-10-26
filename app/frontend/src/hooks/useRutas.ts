import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRutas, crearRuta } from '../api/rutas';
import { IRutaFormData, IParadaRuta } from '../types/ruta';

export const useRutas = () => {
  const queryClient = useQueryClient();

  const rutasQuery = useQuery({
    queryKey: ['rutas'],
    queryFn: getRutas,
  });

  const crearRutaMutation = useMutation({
    mutationFn: (vars: { formData: IRutaFormData; paradas: IParadaRuta[] }) =>
      crearRuta(vars.formData, vars.paradas),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rutas'] });
    },
  });

  return {
    rutas: rutasQuery.data || [],
    isLoading: rutasQuery.isLoading,
    crearRuta: crearRutaMutation.mutateAsync,
    isCreating: crearRutaMutation.isPending,
  };
};
