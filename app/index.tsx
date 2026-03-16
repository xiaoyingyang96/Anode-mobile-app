// import { Redirect } from 'expo-router';

// export default function Index() {
//   return <Redirect href="/login" />;
// }
import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { user, isLoading } = useAuth();

  // Still checking for existing session, show a loading spinner
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // If logged in, go to main app. If not, go to login.
  return user ? <Redirect href="/(tabs)" /> : <Redirect href="/login" />;
}