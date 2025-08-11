import {
  View,
  TextInput,
  useColorScheme,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import useGetList from "./hooks/useGetList";
import { lightTheme, darkTheme } from "./utils/theme";
import { useNavigation } from "expo-router";
import CustomAlert from "./utils/CustomAlert";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import TicketRow from "./components/ticketRow";
import {
  setTicketId,
  setTicketInfo,
  setNavigationInfo,
  setToken,
} from "./db/database";

const TicketList = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [message, setMessage] = useState({
    alertIconColor: "",
    alertIcon: "",
    alertTitle: "",
    alertMessage: "",
    onClose: () => {},
  });
  const { filteredData, GetList } = useGetList(
    search,
    setLoading,
    setAlertVisible,
    setMessage,
    LogOut,
    false
  );
  const limitedData = filteredData ? Array.from(filteredData).slice(0, 20) : [];
  const LogOut = async () => {
    await setToken(null);
    setAlertVisible(false);
    navigation.reset({
      index: 0,
      routes: [{ name: "index" }],
    });
  };
  const handleSearch = (input) => {
    setSearch(input);
  };
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setSearch("");
    GetList();
    setRefreshing(false);
  }, []);
  const goToDetails = async (idTicket, ticket) => {
    await setTicketId(idTicket);
    await setTicketInfo(ticket);
    await setNavigationInfo("ticketList");
    navigation.navigate("ticketDetail");
  };
  useEffect(() => {
    GetList();
  }, []);

  return (
    <>
      <CustomAlert
        visible={alertVisible}
        iconName={message.alertIcon}
        iconColor={message.alertIconColor}
        title={message.alertTitle}
        message={message.alertMessage}
        onClose={message.onClose}
        theme={theme}
      />
      <ScrollView
        style={theme.scrollView}
        contentContainerStyle={theme.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        <View style={theme.containerSearchList}>
          <TextInput
            style={theme.inputListSearch}
            placeholder="Buscar..."
            placeholderTextColor={colorScheme === "dark" ? "#ccc" : "#999"}
            value={search}
            onChangeText={handleSearch}
          />
          <TouchableOpacity>
            <Icon
              name={search ? "window-close" : ""}
              size={24}
              color={colorScheme === "dark" ? "#fff" : "#aaa"}
              style={theme.icon}
              onPress={() => setSearch("")}
            />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#00939C"
            style={{ marginTop: 20 }}
          />
        ) : (
          <View style={{ marginBottom: 10 }}>
            {limitedData.map((file) => (
              <TicketRow
                key={file.id}
                ticket={file}
                goToDetails={() => goToDetails(file.id, file)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </>
  );
};
export default TicketList;
