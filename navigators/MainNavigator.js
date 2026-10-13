import "react-native-gesture-handler";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ActivityIndicator, StatusBar, View } from "react-native";

import WordsNavigation from "./WordsNavigation";
import LearningNavigation from "./LearningNavigation";
import Settings from "../screens/Settings";

import { wordsLearningActions } from "../store/wordsLearningSlice";
import { themeActions } from "../store/themeSlice";
import { REFRESH_STATUSES_SPAN } from "../constants";
import * as dbUtils from "../store/dbUtils";

const Tab = createBottomTabNavigator();

function MainNavigator() {
  const colors = useSelector((state) => state.theme.colors);
  const isDark = useSelector((state) => state.theme.isDark);
  const dispatch = useDispatch();

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        await dbUtils.init();

        const [words, savedIsDark] = await Promise.all([
          dbUtils.getWords(),
          dbUtils.getTheme(),
        ]);

        if (!isMounted) {
          return;
        }

        dispatch(wordsLearningActions.setInitial(words));
        dispatch(themeActions.setInitial(savedIsDark));
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
  }, [dispatch]);

  useEffect(() => {
    if (!isLoaded) {
      return undefined;
    }

    const interval = setInterval(
      () => dispatch(wordsLearningActions.updateStatuses()),
      REFRESH_STATUSES_SPAN
    );

    return () => clearInterval(interval);
  }, [dispatch, isLoaded]);

  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.appBackground,
        }}
      >
        <StatusBar
          backgroundColor={colors.appBackground}
          barStyle={isDark ? "light-content" : "dark-content"}
        />
        <ActivityIndicator size="large" color={colors.primary900} />
      </View>
    );
  }

  return (
    <>
      <StatusBar
        backgroundColor={colors.appBackground}
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarHideOnKeyboard: true,
            headerTitleStyle: { fontWeight: "800" },
            tabBarActiveTintColor: colors.primary900,
            tabBarActiveBackgroundColor: colors.appBackground,
            tabBarInactiveBackgroundColor: colors.appBackground,
            headerStyle: {
              backgroundColor: colors.appBackground,
            },
            headerTintColor: colors.primary900,
            headerTitleAlign: "center",
          }}
        >
          <Tab.Screen
            name="Words"
            options={{
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="list-outline" size={size} color={color} />
              ),
            }}
            component={WordsNavigation}
          />

          <Tab.Screen
            name="Learning"
            component={LearningNavigation}
            options={{
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="book-outline" size={size} color={color} />
              ),
            }}
          />

          <Tab.Screen
            name="Settings"
            component={Settings}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="settings-outline" size={size} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}

export default MainNavigator;