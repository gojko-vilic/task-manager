import { QueryProvider } from '@/api';
import { HomePage } from '@/pages';

function App() {
  return (
    <QueryProvider>
      <HomePage />
    </QueryProvider>
  );
}

export default App;
