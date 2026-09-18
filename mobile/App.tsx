import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { CartProvider } from "./src/context/CartContext";
import LoginScreen from "./src/screens/LoginScreen";
import StoreScreen from "./src/screens/StoreScreen";
import ProductDetailScreen from "./src/screens/ProductDetailScreen";
import CartScreen from "./src/screens/CartScreen";
import WalletScreen from "./src/screens/WalletScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import SupportScreen from "./src/screens/SupportScreen";
import TicketChatScreen from "./src/screens/TicketChatScreen";
import {
  MainTabParamList,
  StoreStackParamList,
  SupportStackParamList,
} from "./src/navigation/types";
import { colors } from "./src/theme";

const StoreStack = createNativeStackNavigator<StoreStackParamList>();
const SupportStack = createNativeStackNavigator<SupportStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

const screenOptions = {
  headerStyle: { backgroundColor: colors.card },
  headerTintColor: colors.text,
  contentStyle: { backgroundColor: colors.background },
};

function StoreNavigator() {
  return (
    <StoreStack.Navigator screenOptions={screenOptions}>
      <StoreStack.Screen name="Products" component={StoreScreen} options={{ title: "المتجر" }} />
      <StoreStack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: "تفاصيل المنتج" }}
      />
    </StoreStack.Navigator>
  );
}

function SupportNavigator() {
  return (
    <SupportStack.Navigator screenOptions={screenOptions}>
      <SupportStack.Screen
        name="Tickets"
        component={SupportScreen}
        options={{ title: "خدمة العملاء" }}
      />
      <SupportStack.Screen name="TicketChat" component={TicketChatScreen} />
    </SupportStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen
        name="StoreTab"
        component={StoreNavigator}
        options={{ title: "المتجر", headerShown: false }}
      />
      <Tabs.Screen name="CartTab" component={CartScreen} options={{ title: "السلة" }} />
      <Tabs.Screen name="WalletTab" component={WalletScreen} options={{ title: "المحفظة" }} />
      <Tabs.Screen
        name="SupportTab"
        component={SupportNavigator}
        options={{ title: "الدعم", headerShown: false }}
      />
      <Tabs.Screen name="ProfileTab" component={ProfileScreen} options={{ title: "حسابي" }} />
    </Tabs.Navigator>
  );
}

function Root() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return user ? <MainTabs /> : <LoginScreen />;
}

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.card,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <NavigationContainer theme={navigationTheme}>
            <StatusBar style="light" />
            <Root />
          </NavigationContainer>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
