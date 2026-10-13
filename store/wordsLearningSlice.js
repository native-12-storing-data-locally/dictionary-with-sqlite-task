
import { createSlice, createSelector } from "@reduxjs/toolkit";
import { INITIAL_FORGETTING_SPAN } from "../constants";
import * as dbUtils from "./dbUtils";

const initialState = {
  words: [],
};

const wordsLearningSlice = createSlice({
  name: "wordsLearning",
  initialState,
  reducers: {
    setInitial(state, action) {
      state.words = action.payload;
    },

    updateWordLearnInfo(state, action) {
      const wordInfo = state.words.find(
        (item) => item.word === action.payload
      );

      if (!wordInfo) return;

      const now = Date.now();

      wordInfo.dateForgets = now + wordInfo.forgettingSpan;
      wordInfo.forgettingSpan *= 2;
      wordInfo.dateTotallyForgets = now + wordInfo.forgettingSpan;
      wordInfo.status = 2;

      dbUtils.updateWord({ ...wordInfo });
    },

    addWord(state, action) {
      if (
        state.words.some(
          (item) => item.word === action.payload.word
        )
      ) {
        return;
      }

      const now = Date.now();

      const wordData = {
        ...action.payload,
        dateForgets: now - INITIAL_FORGETTING_SPAN,
        dateTotallyForgets: now,
        forgettingSpan: INITIAL_FORGETTING_SPAN,
        status: 0,
      };

      state.words.push(wordData);

      dbUtils.addWord({ ...wordData });
    },

    updateWord(state, action) {
      const index = state.words.findIndex(
        (item) => item.word === action.payload.word
      );

      if (index === -1) return;

      state.words[index] = {
        ...state.words[index],
        ...action.payload,
      };

      dbUtils.updateWord({ ...state.words[index] });
    },

    removeWord(state, action) {
      const wordExists = state.words.some(
        (item) => item.word === action.payload
      );

      state.words = state.words.filter(
        (item) => item.word !== action.payload
      );

      if (wordExists) {
        dbUtils.deleteWord(action.payload);
      }
    },

    updateStatuses(state) {
      const now = Date.now();

      for (const wordInfo of state.words) {
        const previousStatus = wordInfo.status;

        if (wordInfo.dateTotallyForgets <= now) {
          wordInfo.status = 0;
        } else if (
          wordInfo.dateForgets <= now &&
          wordInfo.dateTotallyForgets > now
        ) {
          wordInfo.status = 1;
        }

        if (wordInfo.status !== previousStatus) {
          dbUtils.updateWord({ ...wordInfo });
        }
      }
    },
  },
});

export const selectWordsToLearn = createSelector(
  (state) => state.wordsLearning.words,
  (words) => words.filter((word) => word.status < 2)
);

export const wordsLearningActions = wordsLearningSlice.actions;

export default wordsLearningSlice;
