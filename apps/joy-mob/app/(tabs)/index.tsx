import { useRef } from "react";
import { View, StyleSheet, Text } from "react-native";

export default function HomeScreen() {
  return (
    <>
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-xl font-bold text-blue-500">
          Welcome to Nativewind!
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    marginTop: 10,
  },
});
