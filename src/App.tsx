import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from './app/router';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  );
}
