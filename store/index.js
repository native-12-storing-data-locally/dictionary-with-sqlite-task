
import { configureStore } from "@reduxjs/toolkit";

import themeSlice from "./themeSlice";
import wordsLearningSlice from "./wordsLearningSlice";
import * as dbUtils from "./dbUtils";

const store = configureStore({
  reducer: {
    theme: themeSlice.reducer,
    wordsLearning: wordsLearningSlice.reducer,
  },
});

let persistenceEnabled = false;
let previousWords = null;
let previousIsDark = null;
let saveQueue = Promise.resolve();

export function enablePersistence() {
  if (persistenceEnabled) return;

  const state = store.getState();

  previousWords = state.wordsLearning.words;
  previousIsDark = state.theme.isDark;
  persistenceEnabled = true;

  store.subscribe(() => {
    const currentState = store.getState();
    const words = currentState.wordsLearning.words;
    const isDark = currentState.theme.isDark;

    const wordsChanged = words !== previousWords;
    const themeChanged = isDark !== previousIsDark;

    previousWords = words;
    previousIsDark = isDark;

    if (!wordsChanged && !themeChanged) return;

    saveQueue = saveQueue
      .then(async () => {
        if (wordsChanged) {
          const oldWords = new Set(
            previousWordsBeforeSave
          );
        }
      })
      .catch((error) => {
        console.error("Failed to save data:", error);
      });
  });
}

export default store;
