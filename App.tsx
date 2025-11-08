import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/config/toastConfig';

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
      <StatusBar style="auto" />
      <Toast config={toastConfig} />
    </AuthProvider>
  );
}
