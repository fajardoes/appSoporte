import {
  Text,
  View,
  ScrollView,
  Modal,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  Image,
  FlatList,
} from "react-native";
import React, { useState, useEffect } from "react";
import FIcons from "@expo/vector-icons/FontAwesome6";
import FEIcons from "@expo/vector-icons/Feather";
import {
  GestureHandlerRootView,
  TextInput,
} from "react-native-gesture-handler";
import { useNavigation } from "expo-router";
import { lightTheme, darkTheme } from "./utils/theme";
import { setToken } from "./db/database";
import { getSessionData } from "./db/database";
import Constants from "expo-constants";
import CustomAlert from "./utils/CustomAlert";
import { capitalizeFirstLetter } from "./utils/utils";
import * as ImagePicker from "expo-image-picker";
import AttachmentRow from "./components/attachmentRow";

const SupportAdd = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;
  const navigation = useNavigation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubCatDropdownOpen, setIsSubCatDropdownOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const [selectedSubCat, setSelectedSubCat] = useState(null);
  const [showSubCat, setShowSubCat] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const API_URL = Constants.expoConfig?.extra?.API_URL;
  const [message, setMessage] = useState({
    alertIconColor: "",
    alertIcon: "",
    alertTitle: "",
    alertMessage: "",
    onClose: () => {},
  });
  const [loading, setLoading] = useState(false);
  const [parentList, setParentList] = useState([]);
  const [childList, setChildList] = useState([]);
  const [childListF, setChildListF] = useState([]);
  const [data, setData] = useState({
    id: 0,
    title: "",
    catId: 0,
    catName: "",
    subCatId: 0,
    subCatName: "",
    description: "",
  });
  const [selectedImg, setSelectedImg] = useState([]);

  useEffect(() => {
    GetCategories();
  }, []);
  const handleSelectedImg = (newImg) => {
    setSelectedImg(newImg);
  };
  const refreshProcess = () => {
    setData({
      ...data,
      id: 0,
      title: "",
      catId: 0,
      catName: "",
      subCatId: 0,
      subCatName: "",
      description: "",
    });
    setSelectedCat(null);
    setSelectedSubCat(null);
    setSelectedImg([]);
    setShowSubCat(false);
    setAlertVisible(false);
  };
  const handleCatSelect = (selectedItem) => {
    setSelectedCat(selectedItem);
    setSelectedSubCat(null);
    setShowSubCat(true);
    setData({
      ...data,
      catId: selectedItem.id,
      catName: selectedItem.categoryName.toUpperCase(),
      subCatId: 0,
    });
    setChildListF(childList.filter((i) => i.parentId === selectedItem.id));
  };
  const handleSubCatSelect = (selectedItem) => {
    setSelectedSubCat(selectedItem);
    setData({
      ...data,
      subCatId: selectedItem.id,
      subCatName: selectedItem.categoryName.toUpperCase(),
      title: data.catName + " - " + selectedItem.categoryName.toUpperCase(),
    });
  };
  const LogOut = async () => {
    await setToken(null);
    setAlertVisible(false);
    navigation.reset({
      index: 0,
      routes: [{ name: "index" }],
    });
  };
  const GetCategories = async () => {
    try {
      setLoading(true);
      const user = await getSessionData();
      const token = user.token;

      const resp = await fetch(
        `${API_URL}/api/Category/GetCategoryListByUserId/${user.id}`,
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
        const parentL = data.filter((c) => c.parentId === null);
        const childL = parentL.flatMap((p) => p.children || []);
        setParentList(parentL);
        setChildList(childL);
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
          {selectedItem
            ? capitalizeFirstLetter(selectedItem.categoryName)
            : label}
        </Text>
        <FIcons
          name={isOpened ? "chevron-up" : "chevron-down"}
          style={theme.dropdownButtonArrowStyle}
        />
      </TouchableOpacity>
    </View>
  );
  const renderDropdownModal = (data, onSelect, isOpen, toggleModal) => (
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
                  onSelect(item, index);
                  toggleModal();
                }}
              >
                <Text style={theme.modalItemText}>
                  {capitalizeFirstLetter(item.categoryName)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
  const validarFrm = async () => {
    if (data.catId < 1) {
      setLoading(false);
      setAlertVisible(true);
      setMessage({
        ...message,
        alertIconColor: theme.warningColor,
        alertIcon: "alert-outline",
        alertTitle: "Espera",
        alertMessage: "Debes seleccionar una categoría.",
        onClose: () => setAlertVisible(false),
      });
      return false;
    }
    if (data.subCatId < 1) {
      setLoading(false);
      setAlertVisible(true);
      setMessage({
        ...message,
        alertIconColor: theme.warningColor,
        alertIcon: "alert-outline",
        alertTitle: "Espera",
        alertMessage: "Debes seleccionar una sub-categoría.",
        onClose: () => setAlertVisible(false),
      });
      return false;
    }
    if (data.description === "") {
      setLoading(false);
      setAlertVisible(true);
      setMessage({
        ...message,
        alertIconColor: theme.warningColor,
        alertIcon: "alert-outline",
        alertTitle: "Espera",
        alertMessage: "Debes ingresar una descripción.",
        onClose: () => setAlertVisible(false),
      });
      return false;
    }
    if (data.description.length < 5) {
      setLoading(false);
      setAlertVisible(true);
      setMessage({
        ...message,
        alertIconColor: theme.warningColor,
        alertIcon: "alert-outline",
        alertTitle: "Espera",
        alertMessage: "Debes ingresar una descripción válida.",
        onClose: () => setAlertVisible(false),
      });
      return false;
    }
    return true;
  };
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const isValid = await validarFrm();
      if (isValid) {
        //obtengo el usuario
        const user = await getSessionData();
        const actualDate = new Date(Date.now()).toISOString();
        let request = {
          id: 0,
          createdUser: user.id,
          categoryId: data.subCatId,
          title: data.title,
          description: data.description,
          statusId: 1,
          processedBy: user.email,
          createdAt: actualDate,
          attachments: selectedImg ? selectedImg : [],
        };
        const token = user.token;
        //llamo la API
        const resp = await fetch(`${API_URL}/api/Ticket/CreateTicket`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        });
        //valido las respuestas
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
                alertMessage:
                  "Su ticket se registro con éxito, se atenderá a la mayor brevedad posible.",
                onClose: () => refreshProcess(),
              });
            }
            setLoading(false);
          });
        }
        //valido si la API regresa la respuesta del token expirado para salir del sistema
        else if (resp.status === 401) {
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
            alertMessage: "Error creando el ticket.",
            onClose: () => setAlertVisible(false),
          });
        }
      }
    } catch (error) {
      setLoading(false);
      setAlertVisible(true);
      setMessage({
        ...message,
        alertIconColor: theme.alertColor,
        alertIcon: "alert-circle",
        alertTitle: "Error",
        alertMessage: "Error creando el ticket.",
        onClose: () => setAlertVisible(false),
      });
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
        onClose={message.onClose}
        theme={theme}
      />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ScrollView
          style={theme.scrollView}
          contentContainerStyle={theme.scrollContent}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        >
          <View style={theme.rowContainer}>
            {parentList.length > 0 ? (
              <>
                {renderDropdownButton(
                  selectedCat,
                  isDropdownOpen,
                  () => setIsDropdownOpen(!isDropdownOpen),
                  "Seleccione una categoría",
                  "Categorías"
                )}
                {renderDropdownModal(
                  parentList,
                  handleCatSelect,
                  isDropdownOpen,
                  () => setIsDropdownOpen(!isDropdownOpen)
                )}
              </>
            ) : (
              <Text style={theme.label}>Cargando datos...</Text>
            )}
          </View>
          <View style={theme.rowContainer}>
            {showSubCat && (
              <>
                {renderDropdownButton(
                  selectedSubCat,
                  isSubCatDropdownOpen,
                  () => setIsSubCatDropdownOpen(!isSubCatDropdownOpen),
                  "Sub-categoría",
                  "Sub-categorías"
                )}
                {renderDropdownModal(
                  childListF,
                  handleSubCatSelect,
                  isSubCatDropdownOpen,
                  () => setIsSubCatDropdownOpen(!isSubCatDropdownOpen)
                )}
              </>
            )}
          </View>
          {data.subCatId > 0 && (
            <>
              <Text style={theme.labelSm}>Título:</Text>
              <Text style={theme.txtTitle}>
                <Text style={{ fontWeight: "500" }}>{data.title}</Text>
              </Text>

              <Text style={theme.labelSm}>Descripción:</Text>
              <View style={theme.inputContainer}>
                <TextInput
                  style={theme.inputArea}
                  placeholder="Describe tu problema o solicitud en detalle..."
                  placeholderTextColor={
                    colorScheme === "dark" ? "#ccc" : "#999"
                  }
                  value={data.description}
                  onChangeText={(value) =>
                    setData({ ...data, description: value })
                  }
                  multiline={true}
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={550}
                />
              </View>
              <AttachmentRow
                isTech={false}
                onSelectedImg={handleSelectedImg}
                onSelectedImgTech={() => {}}
              />
              <View style={theme.rowContainer}>
                {loading ? (
                  <ActivityIndicator
                    size="large"
                    color="#00939C"
                    style={{ marginTop: 20 }}
                  />
                ) : (
                  <TouchableOpacity
                    style={theme.btnSend}
                    onPress={handleSubmit}
                  >
                    <FEIcons name="send" size={25} color="#fff" />
                    <Text
                      style={{ color: "#fff", marginLeft: 10, fontWeight: 600 }}
                    >
                      Enviar solicitud
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </ScrollView>
      </GestureHandlerRootView>
    </>
  );
};

export default SupportAdd;
