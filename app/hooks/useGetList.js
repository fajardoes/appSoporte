import { useState, useEffect, useMemo } from "react";
import Constants from "expo-constants";
import { Moment, removeAccents } from "../utils/utils";
import { getSessionData } from "../db/database";
import { useColorScheme } from "react-native";
import { lightTheme, darkTheme } from "../utils/theme";

const useGetList = (
  search,
  setLoading,
  setAlertVisible,
  setMessage,
  LogOut,
  isAdmin
) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;
  const [list, setList] = useState([]);
  const [count, setCount] = useState([]);
  const API_URL = Constants.expoConfig?.extra?.API_URL;

  const GetList = async () => {
    try {
      setLoading(true);
      const userData = await getSessionData();
      const token = userData.token;
      const apiUrl = isAdmin
        ? `${API_URL}/api/Ticket/GetTickestListAll`
        : `${API_URL}/api/Ticket/GetTicketsList/${userData.id}`;
      const resp = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (resp.ok) {
        let data = await resp.json();
        // Ordenar la lista por el campo 'orden' y luego por la fecha de creación más reciente
        const sortedData = data.sort((a, b) => {
          if (a.orden !== b.orden) {
            return a.orden - b.orden;
          }
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        const countT = sortedData.filter(
          (t) => t.statusName === "Ingresado" || t.statusName === "Devuelto"
        ).length;
        setCount(countT);
        //actualizo la lista
        setList(sortedData);
        setLoading(false);
      } else if (resp.status === 401) {
        setLoading(false);
        setAlertVisible(true);
        setMessage((prevMessage) => ({
          ...prevMessage,
          alertIconColor: theme.alertColor,
          alertIcon: "alert-circle",
          alertTitle: "Error",
          alertMessage: "Su sesion ha expirado. Por favor ingrese nuevamente.",
          theme: theme,
          onClose: () => LogOut(),
        }));
      } else {
        setLoading(false);
        setAlertVisible(true);
        setMessage((prevMessage) => ({
          ...prevMessage,
          alertIconColor: theme.alertColor,
          alertIcon: "alert-circle",
          alertTitle: "Error",
          alertMessage: "Error obteniendo el API",
          theme: theme,
          onClose: () => setAlertVisible(false),
        }));
      }
    } catch (error) {
      setLoading(false);
      setAlertVisible(true);
      setMessage((prevMessage) => ({
        ...prevMessage,
        alertIconColor: theme.alertColor,
        alertIcon: "alert-circle",
        alertTitle: "Error",
        alertMessage: error,
        theme: theme,
        onClose: () => setAlertVisible(false),
      }));
    }
  };
  // Filtrar los datos
  const filteredData = useMemo(() => {
    if (!search || list.length === 0) return list;

    const filteredLCase = removeAccents(search.toLowerCase());
    return list.filter((i) => {
      const fieldsToSearch = [
        i.assignedUser,
        i.email,
        i.title,
        i.description,
        i.categoryName,
        i.parentCategory,
        i.statusName,
        Moment(i.createdAt).format("l LTS"),
      ];

      return fieldsToSearch.some((field) =>
        removeAccents(String(field).toLowerCase()).includes(filteredLCase)
      );
    });
  }, [search, list]);

  useEffect(() => {
    GetList();
  }, []);

  return { list, setList, filteredData, GetList, count, setCount };
};

export default useGetList;
