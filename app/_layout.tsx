import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/**
 * Root layout for SafeLet - the navigation shell. A consistent right-to-left
 * slide is applied to every screen (slides in from the right, back out to the
 * right when navigating back).
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
    </SafeAreaProvider>
  );
}
