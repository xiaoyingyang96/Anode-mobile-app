import React from 'react';
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
      <Text style={{ fontSize:24, marginBottom:20 }}>Home Screen</Text>
      <Button title="Go to Test Page" onPress={() => router.push('/screens/TestPage')} />
    </View>
  );
}