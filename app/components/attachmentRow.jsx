import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, Image, useColorScheme } from 'react-native';
import FIcons from '@expo/vector-icons/FontAwesome6';
import { lightTheme, darkTheme } from '../utils/theme';
import useImagePicker from "../hooks/useImagePicker";

const AttachmentRow = ({ isTech, onSelectedImg, onSelectedImgTech }) => {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
    const {
        OpenCamera,
        OpenGallery,
        selectedImg,
        selectedImgTech,
        alertVisible,
        message,
        handleRemoveImage,
        handleRemoveImageTech
    } = useImagePicker();

    useEffect(() => {
        if (onSelectedImg) {
            onSelectedImg(selectedImg);
        }
    }, [selectedImg]);

    useEffect(() => {
        if (onSelectedImgTech) {
            onSelectedImgTech(selectedImgTech);
        }
    }, [selectedImgTech]);

    return (
        <View style={theme.uploadImgContainer}>
            <Text style={theme.labelSm}>Agregar adjuntos:</Text>
            <View style={theme.rowUploads}>
                <TouchableOpacity style={theme.buttonUploads} onPress={() => OpenCamera(isTech)}>
                    <Text style={{ color: '#00939C' }}>Cámara</Text>
                    <FIcons name="camera-retro" size={25} color='#00939C' />
                </TouchableOpacity>
                <TouchableOpacity style={theme.buttonUploads} onPress={() => OpenGallery(isTech)}>
                    <Text style={{ color: '#00939C' }}>Galería</Text>
                    <FIcons name="images" size={25} color='#00939C' />
                </TouchableOpacity>
            </View>
            {isTech ? (
                selectedImgTech && selectedImgTech.length > 0 ? (
                    <FlatList
                        data={selectedImgTech}
                        keyExtractor={(item, index) => index.toString()}
                        horizontal={true}
                        style={{ borderRadius: 10, borderWidth: 0.3, marginBottom: 15, padding: 5 }}
                        renderItem={({ item, index }) => (
                            <View style={[theme.imageWrapper]}>
                                <Image
                                    source={{ uri: `data:${item.contentType};base64,${item.fileData}` }}
                                    style={theme.imageStyle}
                                />
                                <Text style={theme.imageLabel}>{item.fileName}</Text>
                                <TouchableOpacity onPress={() => handleRemoveImageTech(index)}>
                                    <FIcons name="trash" size={20} color='rgba(209, 30, 19, 0.7)' marginTop={5} />
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                ) : (
                    <View style={{ alignItems: 'center' }}>
                        <Text style={[theme.label, { marginBottom: 40 }]}>Sin adjuntos</Text>
                    </View>)

            ) : (
                selectedImg && selectedImg.length > 0 ? (
                    <FlatList
                        data={selectedImg}
                        keyExtractor={(item, index) => index.toString()}
                        horizontal={true}
                        style={{ borderRadius: 10, borderWidth: 0.3, marginBottom: 15, padding: 5 }}
                        renderItem={({ item, index }) => (
                            <View style={[theme.imageWrapper]}>
                                <Image
                                    source={{ uri: `data:${item.contentType};base64,${item.fileData}` }}
                                    style={theme.imageStyle}
                                />
                                <Text style={theme.imageLabel}>{item.fileName}</Text>
                                <TouchableOpacity onPress={() => handleRemoveImage(index)}>
                                    <FIcons name="trash" size={20} color='rgba(209, 30, 19, 0.7)' marginTop={5} />
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                ) : (
                    <View style={{ alignItems: 'center' }}>
                        <Text style={[theme.label, { marginBottom: 40 }]}>Sin adjuntos</Text>
                    </View>
                )
            )}
        </View>
    );
};
export default AttachmentRow;