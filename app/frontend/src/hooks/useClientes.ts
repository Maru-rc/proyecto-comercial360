import { useQuery } from '@tanstack/react-query';
import { getClientes } from '../api/clientes';

/** Clients visible to the session, used by selects and reports. */
export const useClientes = () => {
  const clientesQuery = useQuery({
    queryKey: ['clientes'],
    queryFn: () => getClientes(),
  });

  return {
    clientes: clientesQuery.data || [],
    isLoading: clientesQuery.isLoading,
    isError: clientesQuery.isError,
  };
};
