import React, { useCallback, useState, useEffect } from "react";
import {
  ScrollView,
  RefreshControl,
  useColorScheme,
  ActivityIndicator,
  View,
} from "react-native";
import { Card, Text, Badge } from "react-native-paper";
import MCIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { lightTheme, darkTheme } from "../utils/theme";
import CustomAlertQuestion from "../utils/CustomAlertQuestion";
import { getSessionData } from "../db/database";
import useGetList from "../hooks/useGetList";
import CustomAlert from "../utils/CustomAlert";

const MenuScreen = ({ navigateToScreen, LogOut }) => {
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertVisibleNormal, setAlertVisibleNormal] = useState(false);
  const [message, setMessage] = useState({
    alertIconColor: "",
    alertIcon: "",
    alertTitle: "",
    alertMessage: "",
    textYes: "",
    textNo: "",
    onYes: () => {},
    onNo: () => {},
  });
  const [messageT, setMessageT] = useState({
    alertIconColor: "",
    alertIcon: "",
    alertTitle: "",
    alertMessage: "",
    onClose: () => {},
  });
  const [userData, setUserData] = useState();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;
  const [isLoading, setIsLoading] = useState(true);
  const { count, GetList } = useGetList(
    "",
    () => {},
    setAlertVisibleNormal,
    setMessageT,
    LogOut,
    true
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const data = await getSessionData();
    setUserData(data);
    GetList();
    setRefreshing(false);
  }, []);

  const Salir = () => {
    setAlertVisible(true);
    setMessage({
      ...message,
      alertIconColor: theme.questionColor,
      alertIcon: "message-question",
      alertTitle: "Espera",
      alertMessage: "¿Deseas cerrar sesión?",
      textYes: "Si, salir",
      textNo: "No",
      onYes: () => LogOut(),
      onNo: () => setAlertVisible(false),
    });
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSessionData();
        setUserData(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error obteniendo los datos");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchList = async () => {
      try {
        await GetList();
        setIsLoading(false);
      } catch (error) {
        console.error("Error obteniendo los datos");
      }
    };
    fetchList();
  }, [GetList]);

  return (
    <>
      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size={"large"} color={theme.alertText} />
          <Text style={{ marginTop: 10, color: theme.alertText }}>
            Sincronizando datos...
          </Text>
        </View>
      ) : (
        <>
          <CustomAlertQuestion
            visible={alertVisible}
            iconName={message.alertIcon}
            iconColor={message.alertIconColor}
            title={message.alertTitle}
            message={message.alertMessage}
            onYes={message.onYes}
            onNo={message.onNo}
            theme={theme}
            textYes={message.textYes}
            textNo={message.textNo}
          />
          <CustomAlert
            visible={alertVisibleNormal}
            iconName={messageT.alertIcon}
            iconColor={messageT.alertIconColor}
            title={messageT.alertTitle}
            message={messageT.alertMessage}
            onClose={messageT.onClose}
            theme={theme}
          />

          <ScrollView
            contentContainerStyle={theme.menuScreenContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {/* Card: registrar Soporte */}
            {userData &&
              userData.roles &&
              userData.roles?.some((role) =>
                ["Administrador", "Operativo"].includes(role)
              ) && (
                <>
                  <Card
                    style={theme.card}
                    onPress={() => navigateToScreen("supportRegister")}
                  >
                    <Card.Content style={theme.cardContent}>
                      <MCIcons
                        name="view-grid-plus"
                        size={40}
                        color="#218ec6"
                      />
                      <Text style={theme.cardText}>Registrar Soporte</Text>
                    </Card.Content>
                  </Card>
                  <Card
                    style={theme.card}
                    onPress={() => navigateToScreen("ticketListAdm")}
                  >
                    <Card.Content style={theme.cardContent}>
                      <MCIcons name="collage" size={40} color="#ff6666" />
                      <Text style={theme.cardText}>Tickets</Text>
                      <Badge
                        style={{
                          marginLeft: 10,
                          top: -9,
                          fontSize: 14,
                          backgroundColor: "#ff3939",
                          fontWeight: "700",
                          color: "#fff",
                        }}
                      >
                        {count ? count : "0"}
                      </Badge>
                    </Card.Content>
                  </Card>
                </>
              )}
            {/* Card: Solicitar Soporte */}
            <Card
              style={theme.card}
              onPress={() => navigateToScreen("supportAdd")}
            >
              <Card.Content style={theme.cardContent}>
                <MCIcons name="headset" size={40} color="#4CAF50" />
                <Text style={theme.cardText}>Solicitar Soporte</Text>
              </Card.Content>
            </Card>
            {/* Card: Mis Tickets */}
            <Card
              style={theme.card}
              onPress={() => navigateToScreen("ticketList")}
            >
              <Card.Content style={theme.cardContent}>
                <MCIcons name="view-list-outline" size={40} color="#FF9800" />
                <Text style={theme.cardText}>Mis Tickets</Text>
              </Card.Content>
            </Card>
            <Card style={theme.card} onPress={() => Salir()}>
              <Card.Content style={theme.cardContent}>
                <MCIcons name="location-exit" size={40} color="#dc032f" />
                <Text style={theme.cardText}>Salir</Text>
              </Card.Content>
            </Card>
          </ScrollView>
        </>
      )}
    </>
  );
};

export default MenuScreen;
