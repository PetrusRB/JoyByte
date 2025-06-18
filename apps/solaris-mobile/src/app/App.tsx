/* eslint-disable jsx-a11y/accessible-emoji */
import { StyleSheet } from 'react-native';
import {WebView} from "react-native-webview"

export const App = () => {
  return (
    <>
      <WebView style={styles.navegador} source={{uri: "https://joybyte.vercel.app"}}></WebView>
    </>
  );
};
const styles = StyleSheet.create({
  navegador: {
    marginBottom: 20,
    marginTop: 50
  },
});

export default App;
