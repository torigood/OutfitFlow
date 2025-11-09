import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import { ActivityIndicator, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { t } from "../localization/i18n";
import { colors } from "../theme/colors";
import HomeScreen from "../screens/HomeScreen";
import WardrobeScreen from "../screens/WardrobeScreen";
import AIRecommendScreen from "../screens/AIRecommendScreen";
import CommunityScreen from "../screens/FeedScreen";
import ShoppingScreen from "../screens/ShoppingScreen";
import SettingScreen from "../screens/SettingScreen";
import LandingScreen from "../screens/auth/LandingScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import SignupScreen from "../screens/auth/SignupScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";

const Tab = createBottomTabNavigator();
const AuthStack = createStackNavigator();

const createTabIcon =
  (iconName: keyof typeof Ionicons.glyphMap) =>
  ({
    color,
    size,
    focused,
  }: {
    color: string;
    size: number;
    focused: boolean;
  }) =>
    (
      <View
        style={{
          backgroundColor: focused ? colors.brandLight : "transparent",
          borderRadius: 15,
          paddingHorizontal: focused ? 3 : 0,
          paddingVertical: focused ? 3 : 0,
          minWidth: 55,
          minHeight: 55,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons
          name={iconName}
          size={focused ? size + 4 : size}
          color={focused ? colors.brand : color}
        />
      </View>
    );

// Auth Stack Navigator (로그????
function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        // Smooth transition animations
        ...TransitionPresets.SlideFromRightIOS,
        transitionSpec: {
          open: {
            animation: "spring",
            config: {
              stiffness: 1000,
              damping: 500,
              mass: 3,
              overshootClamping: true,
              restDisplacementThreshold: 0.01,
              restSpeedThreshold: 0.01,
            },
          },
          close: {
            animation: "spring",
            config: {
              stiffness: 1000,
              damping: 500,
              mass: 3,
              overshootClamping: true,
              restDisplacementThreshold: 0.01,
              restSpeedThreshold: 0.01,
            },
          },
        },
        cardStyleInterpolator: ({ current, next, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
                {
                  scale: next
                    ? next.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 0.95],
                      })
                    : 1,
                },
              ],
              opacity: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
            },
            overlayStyle: {
              opacity: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.3],
              }),
            },
          };
        },
      }}
    >
      <AuthStack.Screen name="Landing" component={LandingScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
      <AuthStack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
      />
    </AuthStack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();
  const { language } = useLanguage();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.brand,
            tabBarInactiveTintColor: colors.textSecondary,
            tabBarStyle: {
              backgroundColor: colors.white,
              borderTopColor: colors.border,
              height: 72,
              paddingTop: 10,
              paddingBottom: 12,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: "600",
            },
            tabBarIconStyle: {
              marginBottom: -4,
            },
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: t("homeTab"),
              tabBarIcon: createTabIcon("home"),
            }}
          />
          <Tab.Screen
            name="Wardrobe"
            component={WardrobeScreen}
            options={{
              title: t("wardrobeTab"),
              tabBarIcon: createTabIcon("shirt"),
            }}
          />
          <Tab.Screen
            name="AIRecommend"
            component={AIRecommendScreen}
            options={{
              title: t("aiTab"),
              tabBarIcon: createTabIcon("sparkles"),
            }}
          />
          <Tab.Screen
            name="Community"
            component={CommunityScreen}
            options={{
              title: t("communityTab"),
              tabBarIcon: createTabIcon("people"),
            }}
          />
          <Tab.Screen
            name="Shopping"
            component={ShoppingScreen}
            options={{
              title: t("shoppingTab"),
              tabBarIcon: createTabIcon("cart"),
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingScreen}
            options={{
              title: t("settingsTab"),
              tabBarIcon: createTabIcon("settings"),
            }}
          />
        </Tab.Navigator>
      ) : (
        // 로그???? Auth Stack
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
