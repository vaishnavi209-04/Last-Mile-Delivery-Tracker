// src/App.tsx
import { AuthProvider } from './context/authContext';
import { AppRouter } from './routes/appRouter';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;