import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useWindowDimensions, ActivityIndicator, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import WebLayout from "../layouts/WebLayout";
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
const AuthStack = createNativeStackNavigator();

// Auth Stack Navigator (로그인 전)
function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
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
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  // 로딩 중 화면
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
        // 로그인 후: 메인 앱
        isLargeScreen ? (
          <WebNavigator />
        ) : (
          <Tab.Navigator
            screenOptions={{
              tabBarActiveTintColor: "#000",
              tabBarInactiveTintColor: "#999",
            }}
          >
            <Tab.Screen
              name="Home"
              component={HomeScreen}
              options={{
                title: "홈",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="home" size={size} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="Wardrobe"
              component={WardrobeScreen}
              options={{
                title: "옷장",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="shirt" size={size} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="AIRecommend"
              component={AIRecommendScreen}
              options={{
                title: "AI 추천",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="sparkles" size={size} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="Community"
              component={CommunityScreen}
              options={{
                title: "커뮤니티",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="people" size={size} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="Shopping"
              component={ShoppingScreen}
              options={{
                title: "쇼핑",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="cart" size={size} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="Settings"
              component={SettingScreen}
              options={{
                title: "설정",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="settings" size={size} color={color} />
                ),
              }}
            />
          </Tab.Navigator>
        )
      ) : (
        // 로그인 전: Auth Stack
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}

// 웹용 네비게이터 (사이드바 포함)
function WebNavigator() {
  const [currentScreen, setCurrentScreen] = useState("Home");

  const renderScreen = () => {
    switch (currentScreen) {
      case "Home":
        return <HomeScreen />;
      case "Wardrobe":
        return <WardrobeScreen />;
      case "AIRecommend":
        return <AIRecommendScreen />;
      case "Community":
        return <CommunityScreen />;
      case "Shopping":
        return <ShoppingScreen />;
      case "Settings":
        return <SettingScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <WebLayout currentRoute={currentScreen} onNavigate={setCurrentScreen}>
      {renderScreen()}
    </WebLayout>
  );
}
