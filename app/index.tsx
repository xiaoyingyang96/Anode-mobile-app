// // import { useAuth } from '@/context/AuthContext';
// // import { Redirect } from 'expo-router';
// // import { ActivityIndicator, View } from 'react-native';

// // export default function Index() {
// //   const { user, isLoading } = useAuth();

// //   // Still checking for existing session, show a loading spinner
// //   if (isLoading) {
// //     return (
// //       <View className="flex-1 items-center justify-center bg-white dark:bg-black">
// //         <ActivityIndicator size="large" />
// //       </View>
// //     );
// //   }

// //   // If logged in, go to main app. If not, go to login.
// //   return user ? <Redirect href="/(tabs)/explore" /> : <Redirect href="/login" />;
// // }
// import MobileTopStoriesSection from '@/screens/explore/MobileTopStoriesSection';
// import React from 'react';

// export default function TopStoriesTab() {
//   return <MobileTopStoriesSection />;
// }
import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return user ? <Redirect href="/(tabs)/explore" /> : <Redirect href="/login" />;
}