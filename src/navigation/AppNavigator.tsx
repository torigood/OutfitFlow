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

// 화면 import
import HomeScreen from "../screens/HomeScreen";
import WardrobeScreen from "../screens/WardrobeScreen";
import AIRecommendScreen from "../screens/AIRecommendScreen";
import CommunityScreen from "../screens/FeedScreen";
import ShoppingScreen from "../screens/ShoppingScreen";
import SettingScreen from "../screens/SettingScreen";
import CreateFeedScreen from "../screens/CreateFeedScreen";
import PostDetailScreen from "../screens/postDetailScreen"; 

// Auth 화면 import
import LandingScreen from "../screens/auth/LandingScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import SignupScreen from "../screens/auth/SignupScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";

const Tab = createBottomTabNavigator();
const AuthStack = createStackNavigator();
const RootStack = createStackNavigator();

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
          alignItems: "center",
          justifyContent: "center",
          width: 50,
          height: 50,
        }}
      >
        {focused && (
          <View
            style={{
              position: "absolute",
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.softCard,
            }}
          />
        )}
        <Ionicons
          name={focused ? iconName : (`${iconName}-outline` as keyof typeof Ionicons.glyphMap)}
          size={size}
          color={focused ? colors.black : colors.gray}
        />
      </View>
    );

// 1. 메인 탭 네비게이터
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.black,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle: {
          backgroundColor: colors.bgPrimary,
          borderTopColor: colors.borderDefault,
          borderTopWidth: 1,
          height: 85,
          paddingTop: 8,
          paddingBottom: 20,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 0,
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
  );
}

// 2. Auth Stack Navigator
function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        ...TransitionPresets.SlideFromRightIOS,
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

// 3. 메인 AppNavigator
export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bgPrimary }}>
        <ActivityIndicator size="large" color={colors.black} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        // 로그인 상태: RootStack 사용
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {/* 기본 탭 화면 */}
          <RootStack.Screen 
            name="MainTabs" 
            component={MainTabNavigator} 
          />
          
          {/* 글쓰기 화면 (모달 스타일) */}
          <RootStack.Screen 
            name="CreateFeed" 
            component={CreateFeedScreen}
            options={{
              presentation: "modal", 
              ...TransitionPresets.ModalSlideFromBottomIOS, 
            }}
          />
          
          {/* 상세 페이지 (카드 슬라이드 스타일) */}
          <RootStack.Screen 
            name="PostDetail" 
            component={PostDetailScreen}
            options={{ 
              headerShown: false,
              presentation: "card",
              ...TransitionPresets.SlideFromRightIOS,
            }}
          />
        </RootStack.Navigator>
      ) : (
        // 비로그인 상태
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}