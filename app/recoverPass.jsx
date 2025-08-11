import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, useColorScheme, ActivityIndicator, Alert } from 'react-native';
import { lightTheme, darkTheme } from './utils/theme';
import CustomAlert from "./utils/CustomAlert";
import PilarhIcon from './components/PilarhIcon';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Constants from 'expo-constants';
import { useNavigation } from 'expo-router';
import { setToken } from './db/database';

const RecoverPass = () => {
    const inputs = useRef([]);
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
    const [message, setMessage] = useState({
        alertIconColor: '',
        alertIcon: '',
        alertTitle: '',
        alertMessage: '',
        onClose: () => { }
    });
    const [alertVisible, setAlertVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [secureOTP, setSecureOTP] = useState(['', '', '', '']);
    const [showOTP, setShowOTP] = useState(false);
    const navigation = useNavigation();
    const API_URL = Constants.expoConfig?.extra?.API_URL;
    const [loading, setLoading] = useState(false);
    const validateEmail = (email) => {
        // Expresión regular para validar correos electrónicos
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    const handleInputChange = async (text, index) => {
        if (/^\d$/.test(text)) {
            const newOtp = [...secureOTP];
            newOtp[index] = text;
            setSecureOTP(newOtp);
            if (index < 3) {
                inputs.current[index + 1]?.focus();
            }
        };
    };
    const handleBackspace = (nativeEvent, index) => {
        if (nativeEvent.key === 'Backspace') {
            const newOtp = [...secureOTP];


            inputs.current[index - 1]?.focus();
            newOtp[index] = '';


            setSecureOTP(newOtp); // Actualiza el estado
        }
    };
    const handleProcess = async () => {
        if (!email) {
            setMessage({ ...message, alertIconColor: theme.alertColor, alertIcon: 'alert-circle', alertTitle: 'Error', alertMessage: 'Por favor ingresa tu correo', onClose: () => setAlertVisible(false) });
            setAlertVisible(true);
            return;
        }
        if (!validateEmail(email)) {
            setMessage({ ...message, alertIconColor: theme.alertColor, alertIcon: 'alert-circle', alertTitle: 'Error', alertMessage: 'Por favor ingresa una dirección de correo válida', onClose: () => setAlertVisible(false) });
            setAlertVisible(true);
            return;
        };
        setLoading(true);
        try {
            const resp = await fetch(`${API_URL}/api/User/GenerateOTP/${email}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (resp.ok) {
                return resp.json().then(data => {
                    if (data.code === 200) {
                        setMessage({ ...message, alertIconColor: theme.succesColor, alertIcon: 'check-circle', alertTitle: 'Mensaje', alertMessage: 'Te hemos enviado un código de verificación.', onClose: () => afterGenerateOTP() });
                        setAlertVisible(true);
                    } else {
                        setMessage({ ...message, alertIconColor: theme.alertColor, alertIcon: 'alert-circle', alertTitle: 'Error', alertMessage: data.message, onClose: () => setAlertVisible(false) });
                        setAlertVisible(true);
                    }
                    setLoading(false);
                })
            } else {
                setMessage({ ...message, alertIconColor: theme.alertColor, alertIcon: 'alert-circle', alertTitle: 'Error', alertMessage: 'Ha ocurrido un error inesperado.', onClose: () => setAlertVisible(false) });
                setAlertVisible(true);
                setLoading(false);
            }
        } catch (error) {
            setMessage({ ...message, alertIconColor: theme.alertColor, alertIcon: 'alert-circle', alertTitle: 'Error', alertMessage: 'Ha ocurrido un error inesperado: ' + error.message, onClose: () => setAlertVisible(false) });
            setAlertVisible(true);
            setLoading(false);
        }
    };
    const afterGenerateOTP = async () => {
        setAlertVisible(false);
        setShowOTP(true)
        setTimeout(() => inputs.current[0]?.focus(), 0)
    };
    const processOPT = async () => {
        setLoading(true);
        const isValid = await validateOTP();
        if (isValid) {
            setLoading(false);
            navigation.reset({
                index: 1,
                routes: [
                    { name: 'index' },
                    { name: 'resetPass' }
                ],
            });
        } else {
            setLoading(false);
            setMessage({ ...message, alertIconColor: theme.alertColor, alertIcon: 'alert-circle', alertTitle: 'Error', alertMessage: 'Codigo incorrecto.', onClose: () => setAlertVisible(false) });
            setAlertVisible(true);
        }
    }
    const validateOTP = async () => {
        try {
            const optString = secureOTP.join('');
            const resp = await fetch(`${API_URL}/api/User/ValidateOTP/${email}/${optString}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!resp.ok) {
                return false;
            };
            const data = await resp.json();
            await setToken(data.token);
            return data.isValid;
        } catch (error) {
            return false;
        }
    }
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
                    <Icon name="key-chain-variant" size={100} color={colorScheme === 'dark' ? '#fff' : '#000'} />
                </View>
                <Text style={theme.title}>Recuperar credenciales</Text>
                {!showOTP && (
                    <View style={{ alignItems: 'center' }}>
                        <Text style={[theme.txtSM, { marginBottom: 20 }]}>Ingresa tu correo para verificar tu identidad</Text>
                        <View style={theme.container}>
                            <TextInput
                                style={theme.input}
                                placeholder="Correo..."
                                placeholderTextColor={colorScheme === 'dark' ? '#ccc' : '#999'}
                                value={email}
                                onChangeText={setEmail}
                                maxLength={50}
                                autoCapitalize='none'
                            />
                        </View>
                        {loading ? (
                            <ActivityIndicator size="large" color="#00939C" style={{ marginTop: 20 }} />
                        ) : (
                            <>
                                <TouchableOpacity style={[theme.button, { marginTop: 20 }]} onPress={handleProcess}>
                                    <Text style={theme.buttonText}>Confirmar</Text>
                                </TouchableOpacity>
                            </>
                        )}

                    </View>
                )}
                {showOTP && (
                    <View style={{ alignItems: 'center' }}>
                        <Text style={[theme.txtSM, { marginBottom: 20 }]}>Ingresa el código que te enviamos</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20 }}>
                            {Array.from({ length: 4 }).map((_, index) => (
                                <TextInput
                                    key={index}
                                    style={[
                                        theme.inputOTP,
                                        {
                                            width: 50,
                                            height: 50,
                                            marginHorizontal: 5,
                                            textAlign: 'center',
                                            fontSize: 18,
                                        },
                                    ]}
                                    placeholder="◉"
                                    placeholderTextColor={colorScheme === 'dark' ? '#ccc' : '#999'}
                                    maxLength={1}
                                    color={colorScheme === 'dark' ? '#f1f1f1' : '#505050'}
                                    keyboardType="number-pad"
                                    value={secureOTP[index] || ''}
                                    onChangeText={(text) => handleInputChange(text, index)}
                                    ref={(ref) => (inputs.current[index] = ref)}
                                    onKeyPress={({ nativeEvent }) => handleBackspace(nativeEvent, index)}
                                />
                            ))}
                        </View>
                        {loading ? (
                            <ActivityIndicator size="large" color="#00939C" style={{ marginTop: 20 }} />
                        ) : (
                            <TouchableOpacity style={[theme.button, { marginTop: 20 }]} onPress={processOPT}>
                                <Text style={theme.buttonText}>Válidar</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        </>
    )
}
export default RecoverPass;
