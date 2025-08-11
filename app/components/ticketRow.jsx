import React, { useState } from "react";
import { Card, Text } from "react-native-paper";
import { useColorScheme, View } from "react-native";
import { lightTheme, darkTheme } from "../utils/theme";
import {
  capitalizeFirstLetter,
  Moment,
  capitalizeEachWord,
} from "../utils/utils";

const TicketRow = ({ ticket, goToDetails }) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;
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
  const statusColor = getStatusColor(ticket.statusName);
  return (
    <Card
      style={[
        theme.cardList,
        { borderLeftWidth: 3, borderLeftColor: statusColor },
      ]}
      onPress={() => goToDetails(ticket.id)}
    >
      <View style={theme.statusContainer}>
        <Text style={[theme.statusText, { backgroundColor: statusColor }]}>
          {ticket.statusName || "Sin estado"}
        </Text>
      </View>
      <Card.Content style={{ padding: 3 }}>
        <Text style={theme.titleCardList}>
          {capitalizeFirstLetter(ticket.title)}
        </Text>
        <Text style={theme.descriptionCardList}>
          {ticket.description
            ? capitalizeFirstLetter(ticket.description)
            : "N/A"}
        </Text>
        <Text style={theme.detailsCardList}>
          Ingresado por:{" "}
          <Text style={theme.boldTxtCard}>
            {capitalizeEachWord(ticket.firstName + " " + ticket.lastName) ||
              "Sin asignar"}
          </Text>
        </Text>
        <Text style={theme.detailsCardList}>
          Oficina:{" "}
          <Text style={theme.boldTxtCard}>
            {capitalizeEachWord(ticket.branchName) || "Sin asignar"}
          </Text>
        </Text>
        <Text style={theme.detailsCardList}>
          Atendido por:{" "}
          <Text style={theme.boldTxtCard}>
            {ticket.assignedUser || "Sin asignar"}
          </Text>
        </Text>
        <Text style={theme.detailsCardList}>
          Fecha de ingreso:{" "}
          <Text style={theme.boldTxtCard}>
            {ticket.createdAt
              ? Moment(ticket.createdAt).format("l LTS")
              : "N/A"}
          </Text>
        </Text>
      </Card.Content>
    </Card>
  );
};
export default TicketRow;
