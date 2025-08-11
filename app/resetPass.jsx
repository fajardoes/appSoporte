import { View, Text, TextInput, TouchableOpacity, useColorScheme } from 'react-native'
import React, { useState } from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { lightTheme, darkTheme } from './utils/theme';
import { useNavigation } from "expo-router";
import CustomAlert from './utils/CustomAlert';
import PilarhIcon from './components/PilarhIcon'
import { getSessionData, getToken } from './db/database';
import Constants from "expo-constants"

const ResetPass = () => {
    //#region Variables
    const navigation = useNavigation();
    const [newPass, setNewPass] = useState('');
    const [newpassConfirm, setNewPassConfirm] = useState('')
    const [showPassword, setShowPassword] = useState(false);
    const [showPassConfirm, setShowPassConfirm] = useState(false);
    const colorScheme = useColorScheme();
    const [alertVisible, setAlertVisible] = useState(false);
    const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
    const API_URL = Constants.expoConfig?.extra?.API_URL;
    const [message, setMessage] = useState({
        alertIconColor: '',
        alertIcon: '',
        alertTitle: '',
        alertMessage: '',
        onClose: () => { }
    })
    //#endregion
    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };
    const toggleShowPassConfirm = () => {
        setShowPassConfirm(!showPassConfirm);
    };
    const FinishProcess = () => {
        setAlertVisible(false)
        setNewPass('');
        setNewPassConfirm('');
        LogOut();
    };
    const LogOut = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'index' }],
        });
    };
    const handleProcesar = async () => {
        if (newPass !== newpassConfirm) {
            setAlertVisible(true);
            setMessage({ ...message, alertIconColor: theme.alertColor, alertIcon: 'alert-circle', alertTitle: 'Error', alertMessage: 'Las contraseñas no coinciden.', onClose: () => setAlertVisible(false) });
        } else {
            const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
            if (regex.test(newPass)) {
                try {
                    const user = await getSessionData();
                    const localToken = await getToken();
                    const token =  localToken === 'login' ? user.token : localToken; //valido si el cambio de clave viene del login porque el usuario es nuevo o llego desde la recuperacion con el codigo OPT
                    const actualDate = new Date(Date.now()).toISOString();
                    let request = {
                        id: 0,
                        email: '',
                        firstName: '',
                        lastName: '',
                        fromUser: true,
                        token: token,
                        pass: newPass,
                        updatedUser: '',
                        updatedAt: actualDate
                    };
                    const resp = await fetch(`${API_URL}/api/User/ResetUserPass`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(request)
                    });
                    if (resp.ok) {
                        setAlertVisible(true);
                        setMessage({ ...message, alertIconColor: theme.succesColor, alertIcon: 'check-circle', alertTitle: 'Ok', alertMessage: 'Se actualizó la contraseña con éxito.', onClose: () => FinishProcess() });
                    }
                    else if (resp.status === 401) {
                        setAlertVisible(true);
                        setMessage({ ...message, alertIconColor: theme.alertColor, alertIcon: 'alert-circle', alertTitle: 'Mensaje', alertMessage: 'Su sesion ha expirado. Por favor ingrese nuevamente.', onClose: () => LogOut() });
                    }
                    else if (resp.status === 400) {
                        setAlertVisible(true);
                        setMessage({ ...message, alertIconColor: theme.alertColor, alertIcon: 'alert-circle', alertTitle: 'Error: ' + resp.status, alertMessage: 'Ha ocurrido un error inesperado.', onClose: () => setAlertVisible(false) });
                    } else {
                        setAlertVisible(true);
                        setMessage({ ...message, alertIconColor: theme.alertColor, alertIcon: 'alert-circle', alertTitle: 'Error: ' + resp.status, alertMessage: 'Ha ocurrido un error inesperado.', onClose: () => setAlertVisible(false) });
                    }
                } catch (error) {
                    setAlertVisible(true);
                    setMessage({ ...message, alertIconColor: theme.alertColor, alertIcon: 'alert-rhombus-outline', alertTitle: 'Error', alertMessage: error.message || 'Ha ocurrido un error inesperado.', onClose: () => setAlertVisible(false) });
                }
            } else {
                setAlertVisible(true);
                setMessage({ ...message, alertIconColor: theme.alertColor, alertIcon: 'alert-circle-outline', alertTitle: 'Error', alertMessage: 'La contraseña debe contener una letra mayúscula, una letra minúscula, un número y al menos 6 caracteres.', onClose: () => setAlertVisible(false) });
            }
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
            <View style={theme.mainContainer}>
                <View style={theme.imageContainer}>
                    <Icon name="account-lock-outline" size={100} color={colorScheme === 'dark' ? '#fff' : '#000'} />
                </View>
                <View>
                    <PilarhIcon color={colorScheme === 'dark' ? "#fff" : "#000"} />
                </View>
                <Text style={[theme.title]}>Restablecer credenciales</Text>
                <View style={theme.container}>
                    <TextInput
                        style={theme.input}
                        placeholder="Contraseña nueva"
                        placeholderTextColor={colorScheme === 'dark' ? '#ccc' : '#999'}
                        value={newPass}
                        onChangeText={setNewPass}
                        secureTextEntry={!showPassword}
                        maxLength={120}
                        autoCapitalize='none'
                    />
                    <Icon
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={24}
                        color={colorScheme === 'dark' ? '#fff' : '#aaa'}
                        style={theme.icon}
                        onPress={toggleShowPassword}
                    />
                </View>
                <View style={theme.container}>
                    <TextInput
                        style={theme.input}
                        placeholder="Confirmar contraseña"
                        placeholderTextColor={colorScheme === 'dark' ? '#ccc' : '#999'}
                        value={newpassConfirm}
                        onChangeText={setNewPassConfirm}
                        secureTextEntry={!showPassConfirm}
                        maxLength={120}
                        autoCapitalize='none'
                    />
                    <Icon
                        name={showPassConfirm ? 'eye-off' : 'eye'}
                        size={24}
                        color={colorScheme === 'dark' ? '#fff' : '#aaa'}
                        style={theme.icon}
                        onPress={toggleShowPassConfirm}
                    />
                </View>

                <TouchableOpacity style={theme.button} onPress={handleProcesar}>
                    <Text style={theme.buttonText}>Procesar</Text>
                </TouchableOpacity>
            </View>
        </>
    )
}

export default ResetPass;