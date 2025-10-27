import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import WebLayout from "../layouts/WebLayout";
import HomeScreen from "../screens/HomeScreen";
import WardrobeScreen from "../screens/WardrobeScreen";
import AIRecommendScreen from "../screens/AIRecommendScreen";
import CommunityScreen from "../screens/FeedScreen";
import ShoppingScreen from "../screens/ShoppingScreen";
import SettingScreen from "../screens/SettingScreen";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  if (isLargeScreen) {
    // 웹: 커스텀 사이드바 레이아웃
    return <WebNavigator />;
  }

  // 모바일: 하단 탭
  return (
    <NavigationContainer>
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
    <NavigationContainer>
      <WebLayout currentRoute={currentScreen} onNavigate={setCurrentScreen}>
        {renderScreen()}
      </WebLayout>
    </NavigationContainer>
  );
}
