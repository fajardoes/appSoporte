import {
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  useColorScheme,
  ScrollView,
  RefreshControl,
} from "react-native";
import React, { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useNavigation } from "expo-router";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { lightTheme, darkTheme } from "./utils/theme";
import CustomAlert from "./utils/CustomAlert";
import { setSessionData, setToken, getToken } from "./db/database";
import Constants from "expo-constants";
import PilarhIcon from "./components/PilarhIcon";
import usePushNotifications from "./hooks/usePushNotifications";

const Index = () => {
  //#region Variables
  const { expoPushToken, notification } = usePushNotifications();
  const data = JSON.stringify(notification, undefined, 2);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();
  const [alertVisible, setAlertVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const API_URL = Constants.expoConfig?.extra?.API_URL;
  const [message, setMessage] = useState({
    alertIconColor: "",
    alertIcon: "",
    alertTitle: "",
    alertMessage: "",
  });
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;
  const [refreshing, setRefreshing] = useState(false);
  //#endregion
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Llama a las funciones necesarias para actualizar los datos aquí
    setUsername("");
    setPassword("");
    setRefreshing(false);
  }, []);

  const validateEmail = (email) => {
    // Expresión regular para validar correos electrónicos
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const handleLogin = async () => {
    try {
      if (!username || !password) {
        setMessage({
          ...message,
          alertIconColor: theme.alertColor,
          alertIcon: "alert-circle",
          alertTitle: "Error",
          alertMessage: "Por favor ingresa tu nombre de usuario y contraseña",
        });
        setAlertVisible(true);
        return;
      }
      if (!validateEmail(username)) {
        setMessage({
          ...message,
          alertIconColor: theme.alertColor,
          alertIcon: "alert-circle",
          alertTitle: "Error",
          alertMessage: "Por favor ingresa una dirección de correo válida",
        });
        setAlertVisible(true);
        return;
      }
      setLoading(true);
      let request = {
        email: username,
        password: password,
        pushToken: expoPushToken?.data ?? "web",
      };
      const response = await fetch(`${API_URL}/api/User/ValidateUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      if (response.status === 400) {
        const data = await response.json();
        setMessage({
          ...message,
          alertIconColor: theme.alertColor,
          alertIcon: "alert-circle",
          alertTitle: "Error",
          alertMessage: data.message,
        });
        setAlertVisible(true);
        setLoading(false);
      } else if (response.ok) {
        const data = await response.json();
        if (data.code === 400) {
          setMessage({
            ...message,
            alertIconColor: theme.alertColor,
            alertIcon: "alert-circle",
            alertTitle: "Error",
            alertMessage: data.message,
          });
          setAlertVisible(true);
        } else {
          setUsername("");
          setPassword("");
          await setSessionData(data);
          await setToken(data.token);
          if (data.recent) {
            setUsername("");
            setPassword("");
            navigation.navigate("resetPass");
          } else {
            navigation.replace("home");
          }
        }
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      setMessage({
        ...message,
        alertIconColor: theme.alertColor,
        alertIcon: "alert-circle",
        alertTitle: "Error",
        alertMessage:
          "Ocurrió un error al intentar iniciar sesión. Por favor, inténtalo de nuevo más tarde." +
          error.message,
      });
      setAlertVisible(true);
    }
  };
  useFocusEffect(
    useCallback(() => {
      checkSession();
    }, [])
  );

  const checkSession = async () => {
    try {
      const tokenStorage = await getToken();

      if (!navigation || !navigation.getState) return;

      const state = navigation.getState();

      if (!state || !state.routes || state.routes.length === 0) return;

      const currentRoute = state.routes[state.index]?.name;

      if (tokenStorage && currentRoute !== "home") {
        navigation.replace("home");
      } else if (!tokenStorage && currentRoute !== "index") {
        navigation.replace("index");
      }
    } catch (error) {
      setMessage({
        ...message,
        alertIconColor: theme.alertColor,
        alertIcon: "alert-circle",
        alertTitle: "Error",
        alertMessage: error,
      });
      setAlertVisible(true);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <CustomAlert
        visible={alertVisible}
        iconName={message.alertIcon}
        iconColor={message.alertIconColor}
        title={message.alertTitle}
        message={message.alertMessage}
        onClose={() => setAlertVisible(false)}
        theme={theme}
      />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} // Ajusta el offset según sea necesario
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={{ flex: 1 }}
            contentContainerStyle={[theme.mainContainer, { flexGrow: 1 }]}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View style={theme.imageContainer}>
              <Image
                source={require("../assets/images/supportLogo.png")}
                style={theme.image}
              />
            </View>

            <Text style={theme.textMedium}>Credenciales</Text>
            <View style={theme.containerLogin}>
              <TextInput
                style={theme.input}
                placeholder="Correo"
                placeholderTextColor={colorScheme === "dark" ? "#ccc" : "#999"}
                value={username}
                onChangeText={setUsername}
                maxLength={30}
                autoCapitalize="none"
              />
            </View>
            <View style={theme.containerLogin}>
              <TextInput
                style={theme.input}
                placeholder="Contraseña"
                placeholderTextColor={colorScheme === "dark" ? "#ccc" : "#999"}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                maxLength={30}
                autoCapitalize="none"
              />
              <Icon
                name={!showPassword ? "eye-off" : "eye"}
                size={24}
                color={colorScheme === "dark" ? "#fff" : "#aaa"}
                style={theme.icon}
                onPress={toggleShowPassword}
              />
            </View>
            {loading ? (
              <ActivityIndicator
                size="large"
                color="#00939C"
                style={{ marginTop: 20 }}
              />
            ) : (
              <TouchableOpacity style={theme.button} onPress={handleLogin}>
                <Text style={theme.buttonText}>Ingresar</Text>
              </TouchableOpacity>
            )}
            <View style={{ marginTop: 40 }}>
              <TouchableOpacity
                style={theme.btnForgotPass}
                onPress={() => navigation.navigate("recoverPass")}
              >
                <Text style={theme.TxtForgotPass}>
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </>
  );
};

export default Index;
