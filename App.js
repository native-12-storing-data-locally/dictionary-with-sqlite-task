
import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { ActivityIndicator, View } from "react-native";

import store, { enablePersistence } from "./store";
import MainNavigator from "./navigators/MainNavigator";
import * as dbUtils from "./store/dbUtils";

import { wordsLearningActions } from "./store/wordsLearningSlice";
import { themeActions } from "./store/themeSlice";

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        await dbUtils.init();

        const [words, isDark] = await Promise.all([
          dbUtils.getWords(),
          dbUtils.getTheme(),
        ]);

        if (!isMounted) return;

        store.dispatch(wordsLearningActions.setInitial(words));
        store.dispatch(themeActions.setInitial(isDark));

        enablePersistence();
      } catch (error) {
        console.error("Failed to load saved data:", error);
      } finally {
        if (isMounted) {
          setIsLoaded(true);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <MainNavigator />
    </Provider>
  );
}
