// CustomAlert.js
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomAlertQuestion = ({ visible, title, message, onYes, onNo, theme, iconName, iconColor, textYes, textNo}) => {
    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={visible}
            onRequestClose={onNo}
        >
            <View style={styles.centeredView}>
                <View style={[styles.modalView, { backgroundColor: theme.alertBackground }]}>
                    <View style={styles.header}>
                        {iconName && <Icon name={iconName} size={30} color={iconColor} style={{ marginRight: 10 }} />}
                        <Text style={[styles.modalTitle, { color: theme.alertText }]}>{title}</Text>
                    </View>
                    <Text style={[styles.modalText, { color: theme.alertText }]}>{message}</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: theme.alertButtonBackground, marginRight: 10 }]}
                            onPress={onYes}
                        >
                            <Text style={[styles.textStyle, { color: theme.alertButtonText }]}>{textYes}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: theme.alertButtonBackground, marginRight: 20 }]}
                            onPress={onNo}
                        >
                            <Text style={[styles.textStyle, { color: theme.alertButtonText }]}>{textNo}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22
    },
    modalView: {
        margin: 10,
        borderRadius: 20,
        paddingVertical: 15,
        paddingHorizontal: 40,
        alignItems: 'stretch',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 25,
    }
    ,
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    modalTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 10,
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
    button: {
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignSelf: 'flex-end',
    },
    butonContent: {
        alignItems: '',
    },
    textStyle: {
        color: '#ffffff',
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default CustomAlertQuestion;
