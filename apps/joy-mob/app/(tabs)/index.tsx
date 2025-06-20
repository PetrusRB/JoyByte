import { useRef } from 'react';
import { StyleSheet } from 'react-native';

import {WebView} from "react-native-webview"

export default function HomeScreen() {
  const webview = useRef(null)
  return (
    <WebView ref={webview} style={styles.webview} javaScriptEnabled source={{uri: 'https://joybyte.vercel.app'}}/>
  );
}

const styles = StyleSheet.create({
  webview: {
    marginBottom: 20,
    marginTop: 10
  }
});
