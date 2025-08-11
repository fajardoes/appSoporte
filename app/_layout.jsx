import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  useColorScheme,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Stack } from "expo-router";
import MCIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { lightTheme, darkTheme } from "./utils/theme";
import { getSessionData } from "./db/database";

const RootLayout = () => {
  const [userData, setUserData] = useState({});
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await getSessionData();
        setUserData(data);
      } catch (error) {
        console.error("Error al cargar los datos del usuario:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUserData();
  }, []);

  useEffect(() => {
    if (colorScheme === "dark") {
      StatusBar.setBarStyle("light-content");
      StatusBar.setBackgroundColor("#414141");
    } else {
      StatusBar.setBarStyle("dark-content");
      StatusBar.setBackgroundColor("#00939C");
    }
  }, [colorScheme]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.alertText} />
        <Text style={{ marginTop: 10, color: theme.alertText }}>
          Sincronizando datos...
        </Text>
      </View>
    );
  }
  const SupportRegisterTitle = () => (
    <View style={theme.headerTitle}>
      <MCIcons name="view-grid-plus" size={20} color="white" />
      <Text style={theme.headerTitleText}> Registrar Soporte</Text>
    </View>
  );
  const TicketListAdm = () => (
    <View style={theme.headerTitle}>
      <MCIcons name="collage" size={20} color="white" />
      <Text style={theme.headerTitleText}>Tickets</Text>
    </View>
  );
  const SupportAddTitle = () => (
    <View style={theme.headerTitle}>
      <MCIcons name="headset" size={20} color="white" />
      <Text style={theme.headerTitleText}> Solicitar Soporte</Text>
    </View>
  );
  const TicketListTitle = () => (
    <View style={theme.headerTitle}>
      <MCIcons name="view-list" size={20} color="white" />
      <Text style={theme.headerTitleText}> Mis Tickets</Text>
    </View>
  );
  const TicketDetailTitle = () => (
    <View style={theme.headerTitle}>
      <MCIcons name="file-document-outline" size={20} color="white" />
      <Text style={theme.headerTitleText}> Detalles del ticket</Text>
    </View>
  );
  const ResetPassTitle = () => (
    <View style={theme.headerTitle}>
      <MCIcons name="security" size={20} color="white" />
      <Text style={theme.headerTitleText}> Establecer credenciales</Text>
    </View>
  );
  const RecoverPassTitle = () => (
    <View style={theme.headerTitle}>
      <MCIcons name="key-chain-variant" size={20} color="white" />
      <Text style={theme.headerTitleText}> Recuperar credenciales</Text>
    </View>
  );
  const PDFViewerTitle = () => (
    <View style={theme.headerTitle}>
      <MCIcons name="key-chain-variant" size={20} color="white" />
      <Text style={theme.headerTitleText}> Visor de PDF</Text>
    </View>
  );
  const HeaderTitle = () => (
    <View style={theme.headerTitle}>
      {userData && <Text style={theme.headerEmailText}> {userData.email}</Text>}
    </View>
  );

  const HeaderIcon = () => (
    <View style={theme.headerTitle}>
      <MCIcons name="headset" size={30} color="white" />
      <Text style={{color:'#fff', fontSize:20, fontWeight: "semibold"}}> Soporte</Text>
    </View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: theme.backColor }}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.mainColor,
          },
          headerTintColor: "#eeeeee",
          headerTitleStyle: {
            fontWeight: "100",
          },
          cardStyle: {
            backgroundColor: theme.backColor,
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Login",
            headerTitleAlign: "center",
            headerBackVisible: false,
            //          animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="home"
          options={{
            title: "",
            headerBackVisible: false,
            headerRight: () => <HeaderTitle />,
            headerLeft: () => <HeaderIcon />,
            //          animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="supportRegister"
          options={{
            headerTitle: () => <SupportRegisterTitle />,
            headerTitleAlign: "center",
            //         animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="ticketListAdm"
          options={{
            headerTitle: () => <TicketListAdm />,
            headerTitleAlign: "center",
            //           animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="supportAdd"
          options={{
            headerTitle: () => <SupportAddTitle />,
            headerTitleAlign: "center",
            //         animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="ticketList"
          options={{
            headerTitle: () => <TicketListTitle />,
            headerTitleAlign: "center",
            //          animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="ticketDetail"
          options={{
            headerTitle: () => <TicketDetailTitle />,
            headerTitleAlign: "center",
            //          animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="resetPass"
          options={{
            headerTitle: () => <ResetPassTitle />,
            headerTitleAlign: "center",
            //           animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="recoverPass"
          options={{
            headerTitle: () => <RecoverPassTitle />,
            headerTitleAlign: "center",
            //         animation: 'slide_from_right',
          }}
        />
      </Stack>
    </View>
  );
};
export default RootLayout;
