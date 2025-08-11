//#region "Imports"
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  useColorScheme,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import {
  GestureHandlerRootView,
  TextInput,
} from "react-native-gesture-handler";
import {
  getTicketId,
  getSessionData,
  getTicketInfo,
  getNavigationInfo,
} from "./db/database";
import FIcons from "@expo/vector-icons/FontAwesome6";
import MCIcons from "@expo/vector-icons/MaterialCommunityIcons";
import CustomAlert from "./utils/CustomAlert";
import CustomAlertQuestion from "./utils/CustomAlertQuestion";
import { lightTheme, darkTheme } from "./utils/theme";
import Constants from "expo-constants";
import TicketDetails from "./components/ticketDetails";
import { useNavigation } from "expo-router";
import AttachmentRow from "./components/attachmentRow";
//#endregion

const TicketDetail = () => {
  //#region "Variables"
  const inputRefs = {
    UResponseInput: useRef(null),
    descriptionTInput: useRef(null),
  };
  const [selectedImg, setSelectedImg] = useState([]);
  const [selectedImgTech, setSelectedImgTech] = useState([]);
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertVisibleQ, setAlertVisibleQ] = useState(false);
  const [navigationInfo, setNavigationInfo] = useState("");
  const [message, setMessage] = useState({
    alertIconColor: "",
    alertIcon: "",
    alertTitle: "",
    alertMessage: "",
    onClose: () => {},
  });
  const [messageQ, setMessageQ] = useState({
    alertIconColor: "",
    alertIcon: "",
    alertTitle: "",
    alertMessage: "",
    textYes: "",
    textNo: "",
    onYes: () => {},
    onNo: () => {},
  });
  const [selectedIndex, setSelectedIndex] = useState({
    userNew: null,
  });
  const [data, setData] = useState({
    userNewId: 0,
    userResponse: "",
    techResponse: "",
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [userData, setUserData] = useState();
  const API_URL = Constants.expoConfig?.extra?.API_URL;
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [ticket, setTicket] = useState([]);
  const [list, setList] = useState([]);
  const [listAdm, setListAdm] = useState([]);
  const navigation = useNavigation();
  const [reasignModalOpen, setReasignModalOpen] = useState(false);
  const [respModalOpen, setRespModalOpen] = useState(false);
  const [respTechModalOpen, setRespTechModalOpen] = useState(false);
  const [respUserModalOpen, setRespUserModalOpen] = useState(false);
  const [isDropdownUserOpen, setIsDropdownUserOpen] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setRefreshing(false);
  }, []);

  //#endregion
  //#region "Metodos"
  const handleSelectedImg = (newImg) => {
    setSelectedImg(newImg);
  };
  const handleSelectedImgTech = (newImgTech) => {
    setSelectedImgTech(newImgTech);
  };
  const handleSelectNewUser = (selectedItem, index) => {
    setSelectedIndex({ ...selectedIndex, userNew: index });
    setSelectedUser(selectedItem);
    setData({ ...data, userNewId: selectedItem.id });
  };
  const LogOut = () => {
    setAlertVisible(false);
    navigation.reset({
      index: 0,
      routes: [{ name: "index" }],
    });
  };
  const processAssign = async () => {
    setLoading(true);
    setAlertVisibleQ(false);
    try {
      const user = await getSessionData();
      const ticketId = await getTicketId();
      const actualDate = new Date(Date.now()).toISOString();
      let request = {
        ticketId: ticketId,
        statusId: 2,
        isAssign: true,
        coment: "Ticket atendido por " + user.email,
        processedAt: actualDate,
        processedBy: user.email,
      };
      const resp = await fetch(`${API_URL}/api/Ticket/ProcessTicket`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-type": "application/json;charset=utf-8",
        },
        body: JSON.stringify(request),
      });
      if (resp.ok) {
        return resp.json().then((data) => {
          if (data.code === 400) {
            setAlertVisible(true);
            setMessage({
              ...message,
              alertIconColor: theme.alertColor,
              alertIcon: "alert-circle",
              alertTitle: "Espera",
              alertMessage: data.message,
              onClose: () => setAlertVisible(false),
            });
          } else {
            setAlertVisible(true);
            setMessage({
              ...message,
              alertIconColor: theme.succesColor,
              alertIcon: "check-circle",
              alertTitle: "Ticket registrado",
              alertMessage: "Se asignó correctamente.",
              onClose: () => refreshProcess(),
            });
          }
          setLoading(false);
        });
      } else if (resp.status === 401) {
        setLoading(false);
        setAlertVisible(true);
        setMessage({
          ...message,
          alertIconColor: theme.alertColor,
          alertIcon: "alert-circle",
          alertTitle: "Error",
          alertMessage: "Su sesion ha expirado. Por favor ingrese nuevamente.",
          onClose: () => LogOut(),
        });
      } else {
        setLoading(false);
        setAlertVisible(true);
        setMessage({
          ...message,
          alertIconColor: theme.alertColor,
          alertIcon: "alert-circle",
          alertTitle: "Error",
          alertMessage: "Error asignando el ticket.",
          onClose: () => setAlertVisible(false),
        });
      }
    } catch (error) {
      setLoading(false);
      setAlertVisible(true);
      setMessage({
        ...message,
        alertIconColor: theme.alertColor,
        alertIcon: "alert-circle",
        alertTitle: "Error",
        alertMessage: "Error asignando el ticket." + error.message,
        onClose: () => setAlertVisible(false),
      });
    }
  };
  const refreshProcess = async () => {
    const navInfo = await getNavigationInfo();
    if (navInfo === "ticketList") {
      navigation.reset({
        index: 1,
        routes: [{ name: "home", name: "ticketList" }],
      });
    } else {
      navigation.reset({
        index: 1,
        routes: [{ name: "home" }, { name: "ticketListAdm" }],
      });
    }
  };
  const GetTicketHistory = async () => {
    try {
      setLoading(true);
      const ticketInfo = await getTicketInfo();
      setTicket(ticketInfo);
      const userData = await getSessionData();
      const token = userData.token;
      const navInfo = await getNavigationInfo();
      setNavigationInfo(navInfo);
      const ticketId = await getTicketId();
      const resp = await fetch(
        `${API_URL}/api/Ticket/GetTicketHistory/${ticketId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (resp.ok) {
        let data = await resp.json();

        //Ordeno la lista por fecha de creación más reciente
        const sortedData = data.sort(
          (a, b) => new Date(a.processedAt) - new Date(b.processedAt)
        );

        //actualizo la lista
        setList(sortedData);
        setLoading(false);
      } else if (resp.status === 401) {
        setLoading(false);
        setAlertVisible(true);
        setMessage({
          ...message,
          alertIconColor: theme.alertColor,
          alertIcon: "alert-circle",
          alertTitle: "Error",
          alertMessage: "Su sesion ha expirado. Por favor ingrese nuevamente.",
          onClose: () => LogOut(),
        });
      } else {
        setLoading(false);
        setAlertVisible(true);
        setMessage({
          ...message,
          alertIconColor: theme.alertColor,
          alertIcon: "alert-circle",
          alertTitle: "Error :" + resp.status,
          alertMessage: resp.statusText,
          onClose: () => setAlertVisible(false),
        });
      }
    } catch (error) {
      setLoading(false);
      setAlertVisible(true);
      setMessage({
        ...message,
        alertIconColor: theme.alertColor,
        alertIcon: "alert-circle",
        alertTitle: "Error :",
        alertMessage: error.message,
        onClose: () => setAlertVisible(false),
      });
    }
  };
  const CloseTicket = async () => {
    // Mostrar opciones de compartir o descargar
    const downloadOptions = [
      {
        text: "SI",
        onPress: async () => {
          try {
            setLoading(true);
            const userData = await getSessionData();
            const token = userData.token;
            const ticketId = await getTicketId();

            const actualDate = new Date(Date.now()).toISOString();
            let request = {
              ticketId: ticketId,
              statusId: 5,
              coment: "Cerrado por el usuario",
              processedAt: actualDate,
              processedBy: userData.email,
            };
            const resp = await fetch(`${API_URL}/api/Ticket/CloseTicket`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-type": "application/json;charset=utf-8",
              },
              body: JSON.stringify(request),
            });
            if (resp.ok) {
              return resp.json().then((data) => {
                if (data.code === 400) {
                  setLoading(false);
                  setAlertVisible(true);
                  setMessage({
                    ...message,
                    alertIconColor: theme.alertColor,
                    alertIcon: "alert-circle",
                    alertTitle: "Espera",
                    alertMessage: data.message,
                    onClose: () => setAlertVisible(false),
                  });
                } else {
                  setLoading(false);
                  setAlertVisible(true);
                  setMessage({
                    ...message,
                    alertIconColor: theme.succesColor,
                    alertIcon: "check-circle",
                    alertTitle: "Ticket cerrado",
                    alertMessage: "Se cerro el ticket de forma correcta.",
                    onClose: () => refreshProcess(),
                  });
                }
              });
            } else if (resp.status === 401) {
              setLoading(false);
              setAlertVisible(true);
              setMessage({
                ...message,
                alertIconColor: theme.alertColor,
                alertIcon: "alert-circle",
                alertTitle: "Error",
                alertMessage:
                  "Su sesion ha expirado. Por favor ingrese nuevamente.",
                onClose: () => LogOut(),
              });
            } else {
              setLoading(false);
              setAlertVisible(true);
              setMessage({
                ...message,
                alertIconColor: theme.alertColor,
                alertIcon: "alert-circle",
                alertTitle: "Error",
                alertMessage: "Error cerrando el ticket.",
                onClose: () => setAlertVisible(false),
              });
            }
          } catch (error) {
            setLoading(false);
            setAlertVisible(true);
            setMessage({
              ...message,
              alertIconColor: theme.alertColor,
              alertIcon: "alert-circle",
              alertTitle: "Error",
              alertMessage: "Error cerrando el ticket.",
              onClose: () => setAlertVisible(false),
            });
          }
        },
      },
      { text: "NO", style: "cancel" },
    ];
    Alert.alert("Mensaje", "¿Deseas cerrar el ticket?", downloadOptions);
  };
  const GetUserListAdm = async () => {
    try {
      setLoading(true);
      const user = await getSessionData();
      const token = user.token;

      const resp = await fetch(
        `${API_URL}/api/Ticket/GetUserListAdmin/${ticket.idCat}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (resp.ok) {
        const dataFrom = await resp.json();
        dataFrom.sort((a, b) => a.name.localeCompare(b.name));
        const filterData = dataFrom.filter(
          (u) => u.name !== ticket.assignedUser
        );
        setListAdm(filterData);
      } else if (resp.status === 401) {
        setLoading(false);
        setAlertVisible(true);
        setMessage({
          ...message,
          alertIconColor: theme.alertColor,
          alertIcon: "alert-circle",
          alertTitle: "Error",
          alertMessage: "Su sesion ha expirado. Por favor ingrese nuevamente.",
          onClose: () => LogOut(),
        });
      } else {
        setLoading(false);
        setAlertVisible(true);
        setMessage({
          ...message,
          alertIconColor: theme.alertColor,
          alertIcon: "alert-circle",
          alertTitle: "Error :" + resp.status,
          alertMessage: resp.statusText,
          onClose: () => setAlertVisible(false),
        });
      }
    } catch (error) {
      setLoading(false);
      setAlertVisible(true);
      setMessage({
        ...message,
        alertIconColor: theme.alertColor,
        alertIcon: "alert-circle",
        alertTitle: "Error :",
        alertMessage: error.message,
        onClose: () => setAlertVisible(false),
      });
    }
  };
  const btnReasign = async () => {
    setLoading(true);
    if (data.userNewId < 1) {
      setAlertVisible(true);
      setMessage({
        ...message,
        alertIconColor: theme.warningColor,
        alertIcon: "alert-outline",
        alertTitle: "Espera",
        alertMessage: "Por favor, selecciona el usuario.",
        onClose: () => setAlertVisible(false),
      });
      setLoading(false);
      return;
    } else {
      try {
        const user = await getSessionData();
        const resp = await fetch(
          `${API_URL}/api/Ticket/ReasignTicket/${ticket.id}/${data.userNewId}/${user.email}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-type": "application/json;charset=utf-8",
            },
          }
        );
        if (resp.ok) {
          return resp.json().then((data) => {
            if (data.code === 400) {
              setAlertVisible(true);
              setMessage({
                ...message,
                alertIconColor: theme.alertColor,
                alertIcon: "alert-circle",
                alertTitle: "Espera",
                alertMessage: data.message,
                onClose: () => setAlertVisible(false),
              });
            } else {
              setAlertVisible(true);
              setMessage({
                ...message,
                alertIconColor: theme.succesColor,
                alertIcon: "check-circle",
                alertTitle: "Ticket reasignado",
                alertMessage: "Se proceso correctamente.",
                onClose: () => refreshProcess(),
              });
            }
            setLoading(false);
          });
        } else if (resp.status === 401) {
          setLoading(false);
          setAlertVisible(true);
          setMessage({
            ...message,
            alertIconColor: theme.alertColor,
            alertIcon: "alert-circle",
            alertTitle: "Error",
            alertMessage:
              "Su sesion ha expirado. Por favor ingrese nuevamente.",
            onClose: () => LogOut(),
          });
        } else {
          setLoading(false);
          setAlertVisible(true);
          setMessage({
            ...message,
            alertIconColor: theme.alertColor,
            alertIcon: "alert-circle",
            alertTitle: "Error",
            alertMessage: "Error registrando el ticket.",
            onClose: () => setAlertVisible(false),
          });
        }
      } catch (error) {
        setLoading(false);
        setAlertVisible(true);
        setMessage({
          ...message,
          alertIconColor: theme.alertColor,
          alertIcon: "alert-circle",
          alertTitle: "Error",
          alertMessage: "Error reasignando el usuario." + error.message,
          onClose: () => setAlertVisible(false),
        });
      }
    }
  };
  const closeUserModal = async () => {
    setData({ ...data, userNewId: 0 });
    setReasignModalOpen(false);
    setSelectedIndex({ ...selectedIndex, userNew: null });
    setSelectedUser(null);
  };
  const renderDropdownButton = (
    selectedItem,
    isOpened,
    toggleModal,
    label,
    labelSM
  ) => (
    <View>
      <Text style={theme.labelSm}>{labelSM}</Text>
      <TouchableOpacity style={theme.dropdownButtonStyle} onPress={toggleModal}>
        <Text style={theme.dropdownButtonTxtStyle}>
          <>{selectedItem ? selectedItem.name : label}</>
        </Text>
        <FIcons
          name={isOpened ? "chevron-up" : "chevron-down"}
          style={theme.dropdownButtonArrowStyle}
        />
      </TouchableOpacity>
    </View>
  );
  const renderDropdownModal = (
    data,
    onSelect,
    isOpen,
    toggleModal,
    label,
    indexName
  ) => (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={toggleModal}
    >
      <View style={theme.modalContainer}>
        <View style={theme.modalContent}>
          <ScrollView>
            {data.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={theme.modalItem}
                onPress={() => {
                  setSelectedIndex({ ...selectedIndex, [indexName]: index });
                  onSelect(item, index);
                  toggleModal();
                }}
              >
                <View style={{ marginRight: 10 }}>
                  <MCIcons
                    name={
                      selectedIndex[indexName] === index
                        ? "radiobox-marked"
                        : "radiobox-blank"
                    }
                    size={20}
                    color={
                      selectedIndex[indexName] === index ? "#007bc1" : "#ccc"
                    }
                  />
                </View>
                <>
                  <Text style={theme.modalItemText}>{item?.name}</Text>
                </>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={{ marginTop: 20, alignItems: "center" }}>
            <TouchableOpacity
              style={theme.buttonCloseModal}
              onPress={() => setIsDropdownUserOpen(!isDropdownUserOpen)}
            >
              <MCIcons
                name="cancel"
                size={20}
                style={{ marginRight: 5 }}
                color={"#fff"}
              />
              <Text style={{ color: "#fff" }}>{"Cancelar"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
  const toggleModalReasign = async () => {
    setReasignModalOpen(!reasignModalOpen);
    GetUserListAdm();
  };
  const renderReasignModal = (isOpen, toggleModal) => (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={toggleModal}
    >
      <View style={theme.modalContainer}>
        <View style={theme.modalContentTech}>
          <ScrollView>
            <View style={{ marginBottom: 20 }}>
              <Text style={[theme.label, { textDecorationLine: "underline" }]}>
                Reasignar usuario:
              </Text>
            </View>
            {listAdm.length > 0 ? (
              <>
                {renderDropdownButton(
                  selectedUser,
                  isDropdownUserOpen,
                  () => setIsDropdownUserOpen(!isDropdownUserOpen),
                  "Seleccionar usuario",
                  "Usuarios"
                )}
                {renderDropdownModal(
                  listAdm,
                  handleSelectNewUser,
                  isDropdownUserOpen,
                  () => setIsDropdownUserOpen(!isDropdownUserOpen),
                  "Usuarios",
                  "userNew"
                )}
              </>
            ) : (
              <ActivityIndicator
                size="large"
                color="#00939C"
                style={{ marginTop: 20 }}
              />
            )}
            <View style={{ flexDirection: "row", marginTop: 50 }}>
              {loading ? (
                <ActivityIndicator
                  size="large"
                  color="#00939C"
                  style={{ marginTop: 20 }}
                />
              ) : (
                <>
                  <TouchableOpacity
                    style={[theme.btnReasign, { marginRight: 5 }]}
                    onPress={btnReasign}
                  >
                    <MCIcons
                      name="check"
                      size={20}
                      color={"#fff"}
                      style={{ marginRight: 5 }}
                    ></MCIcons>
                    <Text style={{ color: "#fff" }}>{"Confirmar"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={theme.btnCancel}
                    onPress={closeUserModal}
                  >
                    <MCIcons
                      name="cancel"
                      size={20}
                      color={"#fff"}
                      style={{ marginRight: 5 }}
                    ></MCIcons>
                    <Text style={{ color: "#fff" }}>{"Cancelar"}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
  const renderRespTechModal = (isOpen, toggleModal) => (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={toggleModal}
    >
      <View style={theme.modalContainer}>
        <View style={theme.modalContentTech}>
          <ScrollView>
            <View style={{ marginBottom: 20 }}>
              <Text style={[theme.label, { textDecorationLine: "underline" }]}>
                Solución Técnica:
              </Text>
            </View>
            <View style={{ marginTop: 10 }}>
              <Text style={theme.labelSm}>Descripción:</Text>
              <View style={theme.inputContainer}>
                <TextInput
                  ref={inputRefs.descriptionTInput}
                  style={
                    data.techResponse.length > 5
                      ? theme.inputArea
                      : theme.inputAreaAlert
                  }
                  placeholder="Describe tu solución técnica en detalle..."
                  placeholderTextColor={
                    colorScheme === "dark" ? "#ccc" : "#999"
                  }
                  value={data.techResponse}
                  onChangeText={(value) =>
                    setData({ ...data, techResponse: value })
                  }
                  multiline={true}
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={550}
                />
              </View>
            </View>
            <AttachmentRow
              isTech={true}
              onSelectedImgTech={handleSelectedImgTech}
            />
            <View style={theme.rowContainer}>
              {loading ? (
                <ActivityIndicator
                  size="large"
                  color="#00939C"
                  style={{ marginTop: 20 }}
                />
              ) : (
                <>
                  <TouchableOpacity
                    style={theme.btnCancel}
                    onPress={closeTechModalResp}
                  >
                    <MCIcons name="arrow-left" size={20} color="#fff" />
                    <Text
                      style={{ color: "#fff", marginLeft: 10, fontWeight: 600 }}
                    >
                      Volver
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={theme.btnResonse}
                    onPress={() => handleProcess(true)}
                  >
                    <FIcons name="save" size={20} color="#fff" />
                    <Text
                      style={{ color: "#fff", marginLeft: 10, fontWeight: 600 }}
                    >
                      Finalizar
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
  const renderRespModal = (isOpen, toggleModal) => (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={toggleModal}
    >
      <View style={theme.modalContainer}>
        <View style={theme.modalContentTech}>
          <ScrollView>
            <View style={{ marginBottom: 20 }}>
              <Text style={[theme.label, { textDecorationLine: "underline" }]}>
                Respuesta al usuario:
              </Text>
            </View>
            <View style={{ marginTop: 10 }}>
              <Text style={theme.labelSm}>Respuesta al usuario:</Text>
              <View style={theme.inputContainer}>
                <TextInput
                  ref={inputRefs.UResponseInput}
                  style={
                    data.userResponse.length > 5
                      ? theme.inputArea
                      : theme.inputAreaAlert
                  }
                  placeholder="Describe tu respuesta al usuario..."
                  placeholderTextColor={
                    colorScheme === "dark" ? "#ccc" : "#999"
                  }
                  value={data.userResponse}
                  onChangeText={(value) =>
                    setData({ ...data, userResponse: value })
                  }
                  multiline={true}
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={550}
                />
              </View>
            </View>
            <AttachmentRow isTech={false} onSelectedImg={handleSelectedImg} />
            <View style={theme.rowContainer}>
              {loading ? (
                <ActivityIndicator
                  size="large"
                  color="#00939C"
                  style={{ marginTop: 20 }}
                />
              ) : (
                <>
                  <TouchableOpacity
                    style={theme.btnCancel}
                    onPress={cancelResponse}
                  >
                    <MCIcons name="cancel" size={20} color="#fff" />
                    <Text
                      style={{ color: "#fff", marginLeft: 10, fontWeight: 600 }}
                    >
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={theme.btnResonse}
                    onPress={openTechModalResp}
                  >
                    <FIcons name="arrow-right" size={20} color="#fff" />
                    <Text
                      style={{ color: "#fff", marginLeft: 10, fontWeight: 600 }}
                    >
                      Continuar
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
  const renderRespUserModal = (isOpen, toggleModal) => (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={toggleModal}
    >
      <View style={theme.modalContainer}>
        <View style={theme.modalContentTech}>
          <ScrollView>
            <View style={{ marginBottom: 20 }}>
              <Text style={[theme.label, { textDecorationLine: "underline" }]}>
                Respuesta:
              </Text>
            </View>
            <View style={{ marginTop: 10 }}>
              <Text style={theme.labelSm}>Respuesta:</Text>
              <View style={theme.inputContainer}>
                <TextInput
                  ref={inputRefs.UResponseInput}
                  style={
                    data.userResponse.length > 5
                      ? theme.inputArea
                      : theme.inputAreaAlert
                  }
                  placeholder="Describe tu respuesta..."
                  placeholderTextColor={
                    colorScheme === "dark" ? "#ccc" : "#999"
                  }
                  value={data.userResponse}
                  onChangeText={(value) =>
                    setData({ ...data, userResponse: value })
                  }
                  multiline={true}
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={550}
                />
              </View>
            </View>
            <AttachmentRow isTech={false} onSelectedImg={handleSelectedImg} />
            <View style={theme.rowContainer}>
              {loading ? (
                <ActivityIndicator
                  size="large"
                  color="#00939C"
                  style={{ marginTop: 20 }}
                />
              ) : (
                <>
                  <TouchableOpacity
                    style={theme.btnCancel}
                    onPress={cancelResponseUser}
                  >
                    <MCIcons name="cancel" size={20} color="#fff" />
                    <Text
                      style={{ color: "#fff", marginLeft: 10, fontWeight: 600 }}
                    >
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={theme.btnResonse}
                    onPress={handleProcessUser}
                  >
                    <FIcons name="save" size={20} color="#fff" />
                    <Text
                      style={{ color: "#fff", marginLeft: 10, fontWeight: 600 }}
                    >
                      Procesar
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
  const openTechModalResp = () => {
    if (!data.userResponse) {
      setAlertVisible(true);
      inputRefs.UResponseInput.current?.focus();
      setMessage({
        ...message,
        alertIconColor: theme.warningColor,
        alertIcon: "alert-outline",
        alertTitle: "Error",
        alertMessage: "Por favor, ingresa una respuesta al usuario.",
        onClose: () => setAlertVisible(false),
      });
      return;
    } else if (data.userResponse.length <= 5) {
      setAlertVisible(true);
      inputRefs.UResponseInput.current?.focus();
      setMessage({
        ...message,
        alertIconColor: theme.warningColor,
        alertIcon: "alert-outline",
        alertTitle: "Error",
        alertMessage: "Por favor, ingresa una respuesta al usuario válida.",
        onClose: () => setAlertVisible(false),
      });
      return;
    }
    setRespModalOpen(!respModalOpen);
    setRespTechModalOpen(!respTechModalOpen);
  };
  const closeTechModalResp = () => {
    setRespTechModalOpen(false);
    setRespModalOpen(true);
  };
  const handleProcess = async (isFinish) => {
    try {
      setLoading(true);
      if (isFinish) {
        if (!data.techResponse) {
          setLoading(false);
          setAlertVisible(true);
          inputRefs.descriptionTInput.current?.focus();
          setMessage({
            ...message,
            alertIconColor: theme.warningColor,
            alertIcon: "alert-outline",
            alertTitle: "Error",
            alertMessage: "Por favor, ingresa tu solución técnica.",
            onClose: () => setAlertVisible(false),
          });
          return;
        } else if (data.techResponse.length <= 5) {
          setLoading(false);
          setAlertVisible(true);
          inputRefs.descriptionTInput.current?.focus();
          setMessage({
            ...message,
            alertIconColor: theme.warningColor,
            alertIcon: "alert-outline",
            alertTitle: "Espera",
            alertMessage: "Por favor, ingresa una solución técnica válida.",
            onClose: () => setAlertVisible(false),
          });
          return false;
        }
      }

      const user = await getSessionData();
      const ticketId = await getTicketId();
      const actualDate = new Date(Date.now()).toISOString();
      let request = {
        ticketId: ticketId,
        statusId: isFinish ? 3 : 2,
        coment: data.userResponse,
        comentSolution: data.techResponse,
        processedAt: actualDate,
        processedBy: user.email,
        attachments: selectedImg ? selectedImg : [],
        attachmentsTechSolution: selectedImgTech ? selectedImgTech : [],
      };
      const resp = await fetch(`${API_URL}/api/Ticket/ProcessTicket`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-type": "application/json;charset=utf-8",
        },
        body: JSON.stringify(request),
      });

      if (resp.ok) {
        return resp.json().then((data) => {
          if (data.code === 400) {
            setAlertVisible(true);
            setMessage({
              ...message,
              alertIconColor: theme.alertColor,
              alertIcon: "alert-circle",
              alertTitle: "Espera",
              alertMessage: data.message,
              onClose: () => setAlertVisible(false),
            });
          } else {
            setAlertVisible(true);
            setMessage({
              ...message,
              alertIconColor: theme.succesColor,
              alertIcon: "check-circle",
              alertTitle: "Ticket registrado",
              alertMessage: "Se proceso correctamente.",
              onClose: () => refreshProcess(),
            });
          }
          setLoading(false);
        });
      } else if (resp.status === 401) {
        setLoading(false);
        setAlertVisible(true);
        setMessage({
          ...message,
          alertIconColor: theme.alertColor,
          alertIcon: "alert-circle",
          alertTitle: "Error",
          alertMessage: "Su sesion ha expirado. Por favor ingrese nuevamente.",
          onClose: () => LogOut(),
        });
      } else {
        setLoading(false);
        setAlertVisible(true);
        setMessage({
          ...message,
          alertIconColor: theme.alertColor,
          alertIcon: "alert-circle",
          alertTitle: "Error",
          alertMessage: "Error registrando el ticket.",
          onClose: () => setAlertVisible(false),
        });
      }
    } catch (error) {
      setLoading(false);
      setAlertVisible(true);
      setMessage({
        ...message,
        alertIconColor: theme.alertColor,
        alertIcon: "alert-circle",
        alertTitle: "Error",
        alertMessage: "Error procesando el ticket." + error.message,
        onClose: () => setAlertVisible(false),
      });
    }
  };
  const handleProcessUser = async () => {
    try {
      setLoading(true);
      if (data.userResponse.length <= 5) {
        setLoading(false);
        setAlertVisible(true);
        inputRefs.res.current?.focus();
        setMessage({
          ...message,
          alertIconColor: theme.warningColor,
          alertIcon: "alert-outline",
          alertTitle: "Espera",
          alertMessage: "Por favor, ingresa una respuesta válida.",
          onClose: () => setAlertVisible(false),
        });
        return false;
      }
      const user = await getSessionData();
      const ticketId = await getTicketId();
      const actualDate = new Date(Date.now()).toISOString();
      let request = {
        ticketId: ticketId,
        statusId: 2,
        coment: data.userResponse,
        comentSolution: "",
        processedAt: actualDate,
        processedBy: user.email,
        attachments: selectedImg ? selectedImg : [],
        attachmentsTechSolution: [],
      };
      const resp = await fetch(`${API_URL}/api/Ticket/ProcessTicket`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-type": "application/json;charset=utf-8",
        },
        body: JSON.stringify(request),
      });

      if (resp.ok) {
        return resp.json().then((data) => {
          if (data.code === 400) {
            setAlertVisible(true);
            setMessage({
              ...message,
              alertIconColor: theme.alertColor,
              alertIcon: "alert-circle",
              alertTitle: "Espera",
              alertMessage: data.message,
              onClose: () => setAlertVisible(false),
            });
          } else {
            setAlertVisible(true);
            setMessage({
              ...message,
              alertIconColor: theme.succesColor,
              alertIcon: "check-circle",
              alertTitle: "Ticket registrado",
              alertMessage: "Se proceso correctamente.",
              onClose: () => refreshProcess(),
            });
          }
          setLoading(false);
        });
      } else if (resp.status === 401) {
        setLoading(false);
        setAlertVisible(true);
        setMessage({
          ...message,
          alertIconColor: theme.alertColor,
          alertIcon: "alert-circle",
          alertTitle: "Error",
          alertMessage: "Su sesion ha expirado. Por favor ingrese nuevamente.",
          onClose: () => LogOut(),
        });
      } else {
        setLoading(false);
        setAlertVisible(true);
        setMessage({
          ...message,
          alertIconColor: theme.alertColor,
          alertIcon: "alert-circle",
          alertTitle: "Error",
          alertMessage: "Error registrando el ticket.",
          onClose: () => setAlertVisible(false),
        });
      }
    } catch (error) {
      setLoading(false);
      setAlertVisible(true);
      setMessage({
        ...message,
        alertIconColor: theme.alertColor,
        alertIcon: "alert-circle",
        alertTitle: "Error",
        alertMessage: "Error procesando el ticket." + error.message,
        onClose: () => setAlertVisible(false),
      });
    }
  };
  const cancelResponse = async () => {
    setRespModalOpen(false);
    setData({ ...data, userResponse: "", techResponse: "" });
  };
  const cancelResponseUser = async () => {
    setRespUserModalOpen(false);
    setData({ ...data, userResponse: "", techResponse: "" });
  };
  const assignUser = async () => {
    const user = await getSessionData();
    setAlertVisibleQ(true);
    setMessageQ({
      ...messageQ,
      alertIconColor: theme.questionColor,
      alertIcon: "message-question",
      alertTitle: "Asignar ticket",
      alertMessage: "Se asigna a: " + user.email,
      textYes: "Si, continuar",
      textNo: "Cancelar",
      onYes: () => processAssign(),
      onNo: () => setAlertVisibleQ(false),
    });
  };
  useEffect(() => {
    GetTicketHistory();
    const fetchData = async () => {
      const data = await getSessionData();
      setUserData(data);
    };
    fetchData();
  }, []);
  useEffect(() => {
    if (reasignModalOpen) {
      setLoading(false);
    }
  }, [reasignModalOpen]);
  //#endregion

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

      <CustomAlertQuestion
        visible={alertVisibleQ}
        iconName={messageQ.alertIcon}
        iconColor={messageQ.alertIconColor}
        title={messageQ.alertTitle}
        message={messageQ.alertMessage}
        onYes={messageQ.onYes}
        onNo={messageQ.onNo}
        theme={theme}
        textYes={messageQ.textYes}
        textNo={messageQ.textNo}
      />

      <GestureHandlerRootView style={{ flex: 1 }}>
        <ScrollView
          style={theme.containerHistory}
          contentContainerStyle={theme.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        >
          <View>
            <Text style={[theme.boldTxtCard, { marginBottom: 5 }]}>
              {"Título: "}
              <Text style={theme.descriptionCardList}>
                {ticket.title || "N/A"}
              </Text>
            </Text>
            <Text style={[theme.boldTxtCard, { marginBottom: 20 }]}>
              {"Atendido por: "}
              <Text style={theme.descriptionCardList}>
                {ticket.assignedUser || "Sin asignar"}
              </Text>
            </Text>
          </View>
          {ticket &&
            ticket.statusName === "Resuelto" &&
            navigationInfo === "ticketList" && (
              <TouchableOpacity
                style={theme.buttonClose}
                onPress={() => CloseTicket()}
              >
                <Text style={{ color: "#fff" }}>{"Cerrar ticket"}</Text>
              </TouchableOpacity>
            )}
          {userData &&
            userData.roles &&
            userData.roles?.some((role) =>
              ["Administrador", "Operativo"].includes(role)
            ) &&
            navigationInfo === "ticketListAdm" &&
            (ticket.assignedUser ? (
              <>
                {ticket.statusName.toLowerCase() !== "resuelto" &&
                  ticket.statusName.toLowerCase() !== "cerrado" && (
                    <View style={{ flexDirection: "row" }}>
                      <TouchableOpacity
                        style={[theme.btnAssign, { marginRight: 5 }]}
                        onPress={() => setRespUserModalOpen(!respUserModalOpen)}
                      >
                        <MCIcons
                          name="send"
                          size={20}
                          color="#fff"
                          style={{ marginRight: 5 }}
                        />
                        <Text style={{ color: "#fff" }}>{"Responder"}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[theme.btnResonse, { marginRight: 5 }]}
                        onPress={() => setRespModalOpen(!respModalOpen)}
                      >
                        <MCIcons
                          name="reply-all"
                          size={20}
                          color={"#fff"}
                          style={{ marginRight: 5 }}
                        ></MCIcons>
                        <Text style={{ color: "#fff" }}>{"Finalizar"}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={theme.btnReasign}
                        onPress={toggleModalReasign}
                      >
                        <MCIcons
                          name="account-arrow-up"
                          size={20}
                          color={"#fff"}
                          style={{ marginLeft: 5 }}
                        ></MCIcons>
                        <Text style={{ color: "#fff" }}>{"Reasignar"}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[theme.btnAssign, { justifyContent: "center" }]}
                  onPress={assignUser}
                >
                  <MCIcons
                    name="account-plus"
                    size={20}
                    color={"#fff"}
                    style={{ marginRight: 5 }}
                  ></MCIcons>
                  <Text style={{ color: "#fff" }}>{"Atender"}</Text>
                </TouchableOpacity>
              </>
            ))}
          {ticket.assignedUser &&
            navigationInfo === "ticketList" &&
            ticket.statusName.toLowerCase() !== "resuelto" &&
            ticket.statusName.toLowerCase() !== "cerrado" && (
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity
                  style={[theme.btnResonse, { marginRight: 5 }]}
                  onPress={() => setRespUserModalOpen(!respUserModalOpen)}
                >
                  <MCIcons
                    name="reply-all"
                    size={20}
                    color={"#fff"}
                    style={{ marginRight: 5 }}
                  ></MCIcons>
                  <Text style={{ color: "#fff" }}>{"Responder"}</Text>
                </TouchableOpacity>
              </View>
            )}

          <Text style={[theme.descriptionCardList, { marginLeft: 5 }]}>
            {"Historial"}
          </Text>
          {list &&
            list.map((data) => (
              <TicketDetails key={data.id} row={data} ticket={ticket} />
            ))}
          <View style={theme.rowContainer}>
            <>
              {renderReasignModal(reasignModalOpen, () =>
                setReasignModalOpen(!reasignModalOpen)
              )}
              {renderRespModal(respModalOpen, () =>
                setRespModalOpen(!respModalOpen)
              )}
              {renderRespUserModal(respUserModalOpen, () =>
                setRespUserModalOpen(!respUserModalOpen)
              )}
              {renderRespTechModal(respTechModalOpen, openTechModalResp)}
            </>
          </View>
        </ScrollView>
      </GestureHandlerRootView>
    </>
  );
};
export default TicketDetail;
