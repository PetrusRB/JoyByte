import { useRef } from "react";
import { StyleSheet, Text } from "react-native";

export default function HomeScreen() {
  const webview = useRef(null);
  return <Text>Home</Text>;
}

const styles = StyleSheet.create({
  webview: {
    marginBottom: 20,
    marginTop: 10,
  },
});
