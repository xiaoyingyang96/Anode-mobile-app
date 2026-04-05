// import { useAuth } from '@/context/AuthContext';
// import { Button } from '@/components/Button';
// import { ScreenWrapper } from '@/components/ScreenWrapper';
// import { Text, TouchableOpacity, View } from 'react-native';
// import { useColorScheme } from 'nativewind';

// export default function HomeScreen() {
//   const { user, signOut } = useAuth();
//   const { colorScheme, setColorScheme } = useColorScheme();
//   const isDark = colorScheme === 'dark';

//   return (
//     <ScreenWrapper scroll className="px-6">

//         <View className="mt-8 flex-row items-center justify-between">
//           <Text className="text-4xl font-bold text-brand dark:text-brand-dark">
//             Anode
//           </Text>
//           <TouchableOpacity
//             onPress={() => setColorScheme(isDark ? 'light' : 'dark')}
//             className="rounded-full bg-surface px-4 py-2 dark:bg-surface-dark"
//           >
//             <Text className="text-sm font-medium text-black dark:text-white">
//               {isDark ? '☀️ Light' : '🌙 Dark'}
//             </Text>
//           </TouchableOpacity>
//         </View>
//         <Text className="mb-8 text-sm text-muted dark:text-muted-dark">
//           Foundation Sprint — Demo
//         </Text>

//         {/* Auth */}
//         <View className="mb-5 rounded-2xl bg-surface p-5 dark:bg-surface-dark">
//           <Text className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand dark:text-brand-dark">
//             Auth
//           </Text>
//           <Text className="text-xs text-muted dark:text-muted-dark">Signed in as</Text>
//           <Text className="text-sm font-medium text-black dark:text-white">{user?.email ?? '—'}</Text>
//           <Text className="mt-2 text-xs text-muted dark:text-muted-dark">User ID</Text>
//           <Text className="text-sm font-medium text-black dark:text-white" numberOfLines={1}>
//             {user?.id ?? '—'}
//           </Text>
//         </View>

//         {/* Component Library */}
//         <View className="mb-5 rounded-2xl bg-surface p-5 dark:bg-surface-dark">
//           <Text className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand dark:text-brand-dark">
//             Component Library
//           </Text>
//           <Button label="Primary Button" onPress={() => {}} style={{ marginBottom: 10 }} />
//           <Button label="Secondary Button" onPress={() => {}} variant="secondary" style={{ marginBottom: 10 }} />
//           <Button label="Ghost Button" onPress={() => {}} variant="ghost" style={{ marginBottom: 10 }} />
//           <Button label="Loading State" onPress={() => {}} loading style={{ marginBottom: 10 }} />
//           <Button label="Disabled State" onPress={() => {}} disabled />
//         </View>

//         {/* Navigation Stack */}
//         <View className="mb-8 rounded-2xl bg-surface p-5 dark:bg-surface-dark">
//           <Text className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand dark:text-brand-dark">
//             Navigation Stack
//           </Text>
//           {[
//             '/ → auth check',
//             '/login → sign in',
//             '/register → sign up',
//             '/forgot-password → reset',
//             '/(tabs) → main app',
//           ].map((route) => (
//             <Text
//               key={route}
//               className="border-b border-black/10 py-1 font-mono text-xs text-black dark:border-white/10 dark:text-white"
//             >
//               {route}
//             </Text>
//           ))}
//         </View>

//         <Button label="Sign Out" onPress={signOut} variant="secondary" />

//     </ScreenWrapper>
//   );
// }
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/(tabs)/explore" />;
}