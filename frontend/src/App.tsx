import { QueryProvider } from '@/lib';
import { HomePage } from '@/pages';

function App() {
  return (
    <QueryProvider>
      <HomePage />
    </QueryProvider>
  );
}

export default App;
