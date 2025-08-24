import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider';
import AppRoutes from './AppRoutes';
import InstallPrompt from './components/pwa/InstallPrompt';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <InstallPrompt />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
