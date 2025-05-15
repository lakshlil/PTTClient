import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import BottomTabs from './src/navigation/BottomTabs';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
});
  return (
    <PaperProvider>
        <NavigationContainer>
          <BottomTabs />
        </NavigationContainer>
    </PaperProvider>
  );

  
}

