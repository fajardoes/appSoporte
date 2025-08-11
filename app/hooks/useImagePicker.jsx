import { useState } from "react";
import * as ImagePicker from 'expo-image-picker';

const useImagePicker = () => {
    const [alertVisible, setAlertVisible] = useState(false);
    const [message, setMessage] = useState({});
    const [selectedImg, setSelectedImg] = useState([]);
    const [selectedImgTech, setSelectedImgTech] = useState([]);

    const handleRemoveImage = (index) => {
        setSelectedImg((prev) => prev.filter((_, i) => i !== index));
    }; 
    const handleRemoveImageTech = (index) => {
        setSelectedImgTech((prev) => prev.filter((_, i) => i !== index));
    };
    const OpenCamera = async (isTech) => {
        try {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
                setAlertVisible(true);
                setMessage({
                    alertIconColor: theme.alertColor,
                    alertIcon: 'alert-circle',
                    alertTitle: 'Permiso denegado',
                    alertMessage: 'Se necesita acceso a la cámara para tomar fotos.',
                    onClose: () => setAlertVisible(false)
                });
                return;
            }
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images', 'videos'],
                quality: 1,
                base64: true
            });

            if (!result.canceled) {
                const fileData = result.assets[0].base64;
                const fileName = `photo_${Date.now()}.jpg`;
                const contentType = 'image/jpeg';
                const actualDate = new Date(Date.now()).toISOString();

                const fileObj = {
                    id: 0,
                    ticketId: 0,
                    fileName: fileName,
                    contentType: contentType,
                    fileData: fileData,
                    createdAt: actualDate
                };
                if (selectedImg.length === 3) {
                    setAlertVisible(true);
                    setMessage({
                        alertIconColor: theme.alertColor,
                        alertIcon: 'alert-circle',
                        alertTitle: 'Espera',
                        alertMessage: 'Solo se pueden adjuntar 3 imagenes.',
                        onClose: () => setAlertVisible(false)
                    });
                } else {
                    if (isTech) {
                        setSelectedImgTech(prev => [...prev, fileObj]);
                    } else {
                        setSelectedImg(prev => [...prev, fileObj]);
                    }

                }
            }
            if (result.canceled) {
                return
            }

        } catch (error) {
            console.log(error)
        }
    };

    const OpenGallery = async (isTech) => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            setAlertVisible(true);
            setMessage({
                alertIconColor: theme.alertColor,
                alertIcon: 'alert-circle',
                alertTitle: 'Permiso denegado',
                alertMessage: 'Se necesita acceso a la galería para adjuntar imagenes.',
                onClose: () => ToggleModal()
            });
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            allowsMultipleSelection: true,
            selectionLimit: 3,
            quality: 1,
            base64: true
        });
        if (isTech) {
            setSelectedImgTech([])
        } else {
            setSelectedImg([])
        }
        if (!result.canceled) {
            const actualDate = new Date(Date.now()).toISOString();
            result.assets.forEach((asset) => {
                const fileObj = {
                    id: 0,
                    ticketId: 0,
                    fileName: `photo_${Date.now()}.jpg`,
                    contentType: 'image/jpeg',
                    fileData: asset.base64,
                    createdAt: actualDate,
                };
                if (isTech) {
                    setSelectedImgTech(prev => [...prev, fileObj]);
                } else {
                    setSelectedImg(prev => [...prev, fileObj]);
                }
            });
        }
        if (result.canceled) {
            return
        }
    };

    return {
        OpenCamera,
        OpenGallery,
        selectedImg,
        selectedImgTech,
        alertVisible,
        message,
        handleRemoveImage, handleRemoveImageTech
    };
};
export default useImagePicker;