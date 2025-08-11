import React, { useState, useEffect } from "react";
import { Card, Text } from "react-native-paper";
import {
  useColorScheme,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { lightTheme, darkTheme } from "../utils/theme";
import { capitalizeFirstLetter, Moment } from "../utils/utils";
import { useNavigation } from "expo-router";
import { getSessionData } from "../db/database";
import MCIcons from "@expo/vector-icons/MaterialCommunityIcons";
import CustomAlert from "../utils/CustomAlert";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import Constants from "expo-constants";

const TicketDetails = ({ row, ticket }) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;
  const [message, setMessage] = useState({
    alertIconColor: "",
    alertIcon: "",
    alertTitle: "",
    alertMessage: "",
    onClose: () => {},
  });
  const [loading, setLoadng] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [PDFVisible, setPDFVisible] = useState(false);
  const navigation = useNavigation();
  const API_URL = Constants.expoConfig?.extra?.API_URL;
  const [userData, setUserData] = useState();
  const LogOut = () => {
    setAlertVisible(false);
    navigation.reset({
      index: 0,
      routes: [{ name: "index" }],
    });
  };
  const downloadFile = async (fileId, from, contentType) => {
    setLoadng(true);
    try {
      const user = await getSessionData();
      const token = user.token;
      // Hacer solicitud a la API
      const api =
        from === "user"
          ? `${API_URL}/api/Ticket/DownloadFile/${fileId}`
          : `${API_URL}/api/Ticket/DownloadFileMsg/${fileId}`;

      const resp = await fetch(api, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (resp.ok) {
        const contentDisposition = resp.headers.get("Content-Disposition");
        let fileName = "archivo";
        if (contentDisposition) {
          const parts = contentDisposition.split("filename*=");
          if (parts.length > 1) {
            const encodedFileName = parts[1].split(";")[0];
            fileName = decodeURIComponent(
              encodedFileName.replace(/^UTF-8''/, "")
            ).trim();
          } else {
            const fallbackParts = contentDisposition.split("filename=");
            if (fallbackParts.length > 1) {
              fileName = fallbackParts[1]
                .split(";")[0]
                .replace(/['"]+/g, "")
                .trim();
            }
          }
        }
        // Descargar archivo usando expo-file-system
        const fileBlob = await resp.blob();
        const reader = new FileReader();

        return new Promise((resolve, reject) => {
          reader.onloadend = async () => {
            const base64data = reader.result.split(",")[1];
            const fileUri = `${FileSystem.documentDirectory}${fileName}`;

            await FileSystem.writeAsStringAsync(fileUri, base64data, {
              encoding: FileSystem.EncodingType.Base64,
            });
            // Compartir/Guardar archivo
            if (await Sharing.isAvailableAsync()) {
              await Sharing.shareAsync(fileUri);
            } else {
              setAlertVisible(true);
              setMessage({
                ...message,
                alertIconColor: theme.succesColor,
                alertIcon: "check-circle",
                alertTitle: "Descarga",
                alertMessage: `Archivo guardado en: ${fileUri}`,
                onClose: () => setAlertVisible(false),
              });
            }

            resolve();
          };

          reader.onerror = reject;
          reader.readAsDataURL(fileBlob);
          setLoadng(false);
        });
      } else if (resp.status === 401) {
        setLoadng(false);
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
        setLoadng(false);
        setAlertVisible(true);
        setMessage({
          ...message,
          alertIconColor: theme.alertColor,
          alertIcon: "alert-circle",
          alertTitle: "Error",
          alertMessage: resp.statusText,
          onClose: () => setAlertVisible(false),
        });
      }
    } catch (error) {
      setLoadng(false);
      setAlertVisible(true);
      setMessage({
        ...message,
        alertIconColor: theme.alertColor,
        alertIcon: "alert-circle",
        alertTitle: "Error",
        alertMessage: error.message,
        onClose: () => setAlertVisible(false),
      });
    }
  };
  const getStatusColor = (stats) => {
    switch (stats.toLowerCase()) {
      case "ingresado":
        return "#0288d1"; // Azul claro
      case "atendido":
        return "#388e3c"; // Verde claro
      case "resuelto":
        return "#ef6c00"; // Naranja suave
      case "devuelto":
        return "#d32f2f"; // Rojo claro
      case "cerrado":
        return "#616161"; // Gris suave
      default:
        return "#757575"; // Color por defecto (gris oscuro)
    }
  };
  function getIconFileType(fileType) {
    switch (fileType) {
      case "image/jpeg":
        return (
          <MCIcons name="file-image" size={20} style={{ color: "#0288d1" }} />
        );
      case "image/png":
        return (
          <MCIcons name="file-image" size={20} style={{ color: "#0288d1" }} />
        );
      case "text/plain":
        return <MCIcons name="script-text" />;
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return (
          <MCIcons name="file-word" size={20} style={{ color: "#2b7cd3" }} />
        );
      case "application/pdf":
        return (
          <MCIcons name="file-pdf-box" size={20} style={{ color: "#ee5c23" }} />
        );
      case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        return (
          <MCIcons
            name="microsoft-excel"
            size={20}
            style={{ color: "#0f753d" }}
          />
        );
      default:
        return (
          <MCIcons name="script-text" size={20} style={{ color: "#2b7cd3" }} />
        ); // Default icon
    }
  }
  useEffect(() => {
    const fetchData = async () => {
      const data = await getSessionData();
      setUserData(data);
    };
    fetchData();
  }, []);
  const statusColor = getStatusColor(row.newStatus);
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
      <Card
        style={[
          theme.historyCardList,
          { borderLeftWidth: 2, borderLeftColor: statusColor },
        ]}
      >
        <View style={theme.statusContainer}>
          <Text style={[theme.statusText, { backgroundColor: statusColor }]}>
            {row.newStatus || "Sin estado"}
          </Text>
        </View>
        <Card.Content style={{ padding: 3 }}>
          <Text style={theme.descriptionCardList}>
            {row.processedAt ? Moment(row.processedAt).format("l LTS") : "N/A"}
          </Text>
          <Text style={theme.boldTxtCard}>
            {row.newStatus === "Ingresado"
              ? "Ingresado por: "
              : "Procesado por: "}
            <Text style={theme.descriptionCardList}>
              {row.processedBy ? row.processedBy.toLowerCase() : "N/A"}
            </Text>
          </Text>
          <View
            style={{
              marginLeft: 5,
              paddingVertical: 5,
              borderLeftColor: "#9f9f9f",
              borderLeftWidth: 1,
              padding: 5,
              borderBottomLeftRadius: 5,
            }}
          >
            <Text style={theme.boldTxtCard}>
              {"Comentario: "}
              <Text style={theme.descriptionCardList}>
                {capitalizeFirstLetter(row.coment) || "N/A"}
              </Text>
            </Text>
            <Text style={theme.boldTxtCard}>
              {"Estado previo: "}
              <Text style={theme.descriptionCardList}>
                {row.previousStatus
                  ? capitalizeFirstLetter(row.previousStatus)
                  : "N/A"}
              </Text>
            </Text>
          </View>
          {row.newStatus === "Ingresado" && (
            <>
              {ticket.attachments.length > 0 && (
                <>
                  <View
                    style={{
                      marginLeft: 16,
                      paddingVertical: 5,
                      borderLeftColor: "#9f9f9f",
                      borderLeftWidth: 1,
                      padding: 5,
                      borderBottomLeftRadius: 5,
                    }}
                  >
                    <Text style={theme.boldTxtCard}>Adjuntos:</Text>
                  </View>
                  {ticket.attachments.map((attachment) => (
                    <View
                      key={attachment.id}
                      style={{
                        alignItems: "flex-start",
                        marginLeft: 25,
                        borderLeftColor: "#9f9f9f",
                        borderLeftWidth: 1,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                      }}
                    >
                      {loading ? (
                        <ActivityIndicator
                          size="small"
                          color="#00939C"
                          style={{ marginTop: 20 }}
                        />
                      ) : (
                        <TouchableOpacity
                          style={theme.buttonDownloads}
                          onPress={() =>
                            downloadFile(
                              attachment.id,
                              "user",
                              attachment.contentType
                            )
                          }
                        >
                          <Text>{getIconFileType(attachment.contentType)}</Text>
                          <Text style={theme.imageLabel}>
                            {" "}
                            {attachment.fileName}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </>
              )}
            </>
          )}
          {row.attachments.length > 0 && (
            <>
              <View
                style={{
                  marginLeft: 16,
                  paddingVertical: 5,
                  borderLeftColor: "#9f9f9f",
                  borderLeftWidth: 1,
                  padding: 5,
                  borderBottomLeftRadius: 5,
                }}
              >
                <Text style={theme.boldTxtCard}>Adjuntos:</Text>
              </View>
              {row.attachments
                .filter((f) => !f.isTechSolution)
                .map((attachment) => (
                  <View
                    key={attachment.id}
                    style={{
                      alignItems: "flex-start",
                      marginLeft: 25,
                      borderLeftColor: "#9f9f9f",
                      borderLeftWidth: 1,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                    }}
                  >
                    <TouchableOpacity
                      style={theme.buttonDownloads}
                      onPress={() => downloadFile(attachment.id, "tech")}
                    >
                      <Text>{getIconFileType(attachment.contentType)}</Text>
                      <Text style={theme.imageLabel}>
                        {" "}
                        {attachment.fileName}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
            </>
          )}
          {userData &&
            userData.roles &&
            userData.roles?.some((role) =>
              ["Administrador", "Operativo"].includes(role)
            ) && (
              <>
                {row.newStatus === "Resuelto" && row.comentSolution && (
                  <>
                    <View
                      style={{
                        marginLeft: 30,
                        paddingVertical: 5,
                        borderLeftColor: "#9f9f9f",
                        borderLeftWidth: 1,
                        padding: 5,
                        borderBottomLeftRadius: 5,
                      }}
                    >
                      <Text style={theme.boldTxtCard}>
                        {"Respesta de solución: "}
                        <Text style={theme.descriptionCardList}>
                          {capitalizeFirstLetter(row.comentSolution) || "N/A"}
                        </Text>
                      </Text>
                    </View>
                  </>
                )}
                {row.attachments.length > 0 && (
                  <>
                    <View
                      style={{
                        marginLeft: 50,
                        paddingVertical: 5,
                        borderLeftColor: "#9f9f9f",
                        borderLeftWidth: 1,
                        padding: 5,
                        borderBottomLeftRadius: 5,
                      }}
                    >
                      <Text style={theme.boldTxtCard}>Adjuntos:</Text>
                    </View>
                    {row.attachments
                      .filter((f) => f.isTechSolution)
                      .map((attachment) => (
                        <View
                          key={attachment.id}
                          style={{
                            alignItems: "flex-start",
                            marginLeft: 60,
                            borderLeftColor: "#9f9f9f",
                            borderLeftWidth: 1,
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                          }}
                        >
                          <TouchableOpacity
                            style={theme.buttonDownloads}
                            onPress={() => downloadFile(attachment.id, "tech")}
                          >
                            <Text>
                              {getIconFileType(attachment.contentType)}
                            </Text>
                            <Text style={theme.imageLabel}>
                              {" "}
                              {attachment.fileName}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                  </>
                )}
              </>
            )}
        </Card.Content>
      </Card>
    </>
  );
};
export default TicketDetails;
