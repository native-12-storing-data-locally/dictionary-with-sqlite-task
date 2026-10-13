import "react-native-gesture-handler";
import React from "react";
import { Provider } from "react-redux";

export default function App() {
  return (
    <Provider store={store}>
      <MainNavigator />
    </Provider>
  );
}