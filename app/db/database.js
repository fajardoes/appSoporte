import AsyncStorage from "@react-native-async-storage/async-storage";

export const setSessionData = async (sessionData) => {
  try {
    // Vaciar datos previos
    await AsyncStorage.removeItem("sessionData");

    // Insertar los nuevos datos
    await AsyncStorage.setItem("sessionData", JSON.stringify(sessionData));
  } catch (error) {
    throw new Error(
      "Error al insertar los datos de la sesión: " + error.message
    );
  }
};
export const getSessionData = async () => {
  try {
    const data = await AsyncStorage.getItem("sessionData");
    return JSON.parse(data) || [];
  } catch (error) {
    throw new Error(
      "Error al insertar los datos de la sesión: " + error.message
    );
  }
};

export const setTicketId = async (value) => {
  try {
    // Vaciar datos previos
    await AsyncStorage.removeItem("ticketId");

    // Insertar los nuevos datos
    await AsyncStorage.setItem("ticketId", value.toString());
  } catch (error) {
    throw new Error(
      "Error al insertar los datos de la sesión: " + error.message
    );
  }
};

export const getTicketId = async () => {
  try {
    const value = await AsyncStorage.getItem("ticketId");
    return value || "";
  } catch (error) {
    throw new Error(
      "Error al insertar los datos de la sesión: " + error.message
    );
  }
};
export const setNavigationInfo = async (value) => {
  try {
    // Vaciar datos previos
    await AsyncStorage.removeItem("navigationInfo");

    // Insertar los nuevos datos
    await AsyncStorage.setItem("navigationInfo", value.toString());
  } catch (error) {
    throw new Error(
      "Error al insertar los datos de la navegacion: " + error.message
    );
  }
};
export const getNavigationInfo = async () => {
  try {
    const value = await AsyncStorage.getItem("navigationInfo");
    return value || "";
  } catch (error) {
    throw new Error(
      "Error al insertar los datos de la sesión: " + error.message
    );
  }
};

export const setTicketInfo = async (data) => {
  try {
    // Vaciar datos previos
    await AsyncStorage.removeItem("ticketInfo");

    // Insertar los nuevos datos
    await AsyncStorage.setItem("ticketInfo", JSON.stringify(data));
  } catch (error) {
    throw new Error(
      "Error al insertar los datos de la sesión: " + error.message
    );
  }
};

export const getTicketInfo = async () => {
  try {
    const data = await AsyncStorage.getItem("ticketInfo");
    return JSON.parse(data) || [];
  } catch (error) {
    throw new Error(
      "Error al insertar los datos de la sesión: " + error.message
    );
  }
};

export const setToken = async (data) => {
  try {
    if (!data) {
      await AsyncStorage.removeItem("token");
      return;
    }
    // Insertar los nuevos datos
    await AsyncStorage.setItem("token", JSON.stringify(data));
  } catch (error) {
    throw new Error("Error al insertar los datos del token: " + error.message);
  }
};

export const getToken = async () => {
  try {
    const data = await AsyncStorage.getItem("token");
    if (!data) return null; // Si no hay token, retorna null
    return data;
  } catch (error) {
    throw new Error("Error al obtener el token: " + (error?.message || error));
  }
};

export default {
  setSessionData,
  getSessionData,
  setTicketId,
  getTicketId,
  setTicketInfo,
  getTicketInfo,
};
