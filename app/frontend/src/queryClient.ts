import { QueryClient } from '@tanstack/react-query';

// Una sola caché para toda la app: el store de auth la vacía al cambiar de
// usuario, para que nadie vea los datos que cargó la sesión anterior
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
