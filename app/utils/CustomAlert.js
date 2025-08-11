// CustomAlert.js
import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const CustomAlert = ({
  visible,
  title,
  message,
  onClose,
  theme,
  iconName,
  iconColor,
}) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View
          style={[styles.modalView, { backgroundColor: theme.alertBackground }]}
        >
          <View style={styles.header}>
            {iconName && <Icon name={iconName} size={25} color={iconColor} />}
            <Text style={[styles.modalTitle, { color: theme.alertText }]}>
              {title}
            </Text>
          </View>
          <Text style={[styles.modalText, { color: theme.alertText }]}>
            {message}
          </Text>
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: theme.alertButtonBackground },
            ]}
            onPress={onClose}
          >
            <Text style={[styles.textStyle, { color: theme.alertButtonText }]}>
              OK
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 15,
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 25,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 10,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  button: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: "flex-end",
  },
  butonContent: {
    alignItems: "",
  },
  textStyle: {
    fontWeight: "600",
    textAlign: "center",
  },
});

export default CustomAlert;
