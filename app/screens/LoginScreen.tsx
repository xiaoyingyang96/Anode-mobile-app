import React from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();

  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center', padding:20 }}>
      <Text style={{ fontSize:24, marginBottom:20 }}>Login Screen</Text>

      <Text>Username</Text>
      <TextInput style={{ borderWidth:1, width:'80%', marginBottom:10, padding:5 }} />

      <Text>Password</Text>
      <TextInput style={{ borderWidth:1, width:'80%', marginBottom:20, padding:5 }} secureTextEntry />

      <Button title="Login" onPress={() => router.push('/screens/HomeScreen')} />
    </View>
  );
}