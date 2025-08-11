import React, { useEffect, useState, useRef } from "react";
import { Text, View, ScrollView, Modal, TouchableOpacity, useColorScheme, ActivityIndicator, Image, FlatList } from 'react-native';
import CustomAlert from "./utils/CustomAlert";
import { getSessionData } from "./db/database";
import { lightTheme, darkTheme } from './utils/theme';
import FIcons from '@expo/vector-icons/FontAwesome6';
import MIcons from '@expo/vector-icons/MaterialCommunityIcons'
import Constants from 'expo-constants'
import { useNavigation } from 'expo-router';
import { capitalizeFirstLetter, capitalizeEachWord } from './utils/utils';
import { GestureHandlerRootView, TextInput } from "react-native-gesture-handler";
import * as ImagePicker from 'expo-image-picker';
import AttachmentRow from "./components/attachmentRow";

const SupportRegister = () => {
    const inputRefs = {
        descriptionInput: useRef(null),
        UResponseInput: useRef(null),
        descriptionTInput: useRef(null)
    }
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState({
        Branch: null,
        Users: null,
        Cats: null,
        SubCats: null
    });
    const [data, setData] = useState({
        id: 0,
        branchId: 0,
        userId: 0,
        categoryId: 0,
        subCatId: 0,
        catName: '',
        subCatName: '',
        title: '',
        description: '',
        userResponse: '',
        descriptionTech: ''
    });
    const [selectedImg, setSelectedImg] = useState([]);
    const [selectedImgTech, setSelectedImgTech] = useState([]);
    const [alertVisible, setAlertVisible] = useState(false);
    const [listBranch, setListBranch] = useState([]);
    const [listUser, setListUser] = useState([]);
    const [listUserF, setListUserF] = useState([]);
    const [parentList, setParentList] = useState([]);
    const [childList, setChildList] = useState([]);
    const [childListF, setChildListF] = useState([]);
    const [message, setMessage] = useState({
        alertIconColor: '',
        alertIcon: '',
        alertTitle: '',
        alertMessage: '',
        onClose: () => { }
    });
    const navigation = useNavigation();
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedCat, setSelectedCat] = useState(null);
    const [selectedSubCat, setSelectedSubCat] = useState(null);
    const [showUser, setShowUser] = useState(false);
    const [showCats, setShowCats] = useState(false);
    const [showSubCats, setShowSubCats] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isCatDropdownOpen, setCatDropdownOpen] = useState(false);
    const [isSubCatDropdownOpen, setSubCatDropdownOpen] = useState(false);
    const [isTechmodalOpen, setIsTechModalOpen] = useState(false);
    const API_URL = Constants.expoConfig?.extra?.API_URL;

    const LogOut = () => {
        setAlertVisible(false);
        navigation.reset({
            index: 0,
            routes: [{ name: 'index' }],
        });
    };
    const handleSelectedImg = (newImg) => {
        setSelectedImg(newImg);
    };
    const handleSelectImgTech = (newImgTech) => {
        setSelectedImgTech(newImgTech);
    };
    const handleBranchSelect = (selectedItem, index) => {
        setSelectedBranch(selectedItem);
        setSelectedUser(null);
        setSelectedSubCat(null);
        setSelectedCat(null);
        setListUserF(listUser.filter(i => i.branchId === selectedItem.id));
        setSelectedIndex(() => ({
            Branch: index,
            Users: null,
            Cats: null,
            SubCats: null
        }));
        setData({ ...data, branchId: selectedItem.id, subCatId: 0 });
        setShowCats(false);
        setShowUser(true);
    };
    const handleUserSelect = (selectedItem, index) => {
        setSelectedUser(selectedItem);
        GetCategories(selectedItem.id);
        setSelectedSubCat(null);
        setSelectedCat(null);
        setData({ ...data, userId: selectedItem.id, subCatId: 0 });
        setShowCats(true);
        setShowSubCats(false);
        setSelectedIndex((prev) => ({
            Branch: prev.Branch,
            Users: index,
            Cats: null,
            SubCats: null
        }));
    }
    const handleCatSelect = (selectedItem, index) => {
        setSelectedCat(selectedItem);
        setSelectedSubCat(null);
        setShowSubCats(true);
        setData({ ...data, catId: selectedItem.id, catName: selectedItem.categoryName.toUpperCase(), subCatId: 0 });
        setChildListF(childList.filter(i => i.parentId === selectedItem.id));
        setSelectedIndex((prev) => ({
            Branch: prev.Branch,
            Users: prev.Users,
            Cats: index,
            SubCats: null
        }));

    };
    const handleSubCatSelect = (selectedItem) => {
        setSelectedSubCat(selectedItem);
        setData({ ...data, subCatId: selectedItem.id, subCatName: selectedItem.categoryName.toUpperCase(), title: data.catName + ' - ' + selectedItem.categoryName.toUpperCase() });
    };
    const GetBranchList = async () => {
        try {
            setLoading(true);
            const user = await getSessionData();
            const token = user.token;

            const resp = await fetch(`${API_URL}/api/Branch/GetBranchList/${''}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (resp.ok) {
                let data = await resp.json();
                let filterData = data.filter(i => i.state === true);
                filterData.sort((a, b) => a.branchName.localeCompare(b.branchName));
                setListBranch(filterData);
                setLoading(false);
            } else if (resp.status === 401) {
                setLoading(false)
                setAlertVisible(true);
                setMessage({ ...message, alertIconColor: theme.alertColor, alertIcon: 'alert-circle', alertTitle: 'Error', alertMessage: 'Su sesion ha expirado. Por favor ingrese nuevamente.', onClose: () => LogOut() });
            } else {
                setLoading(false);
                setAlertVisible(true);
                setMessage({ ...message, alertIconColor: theme.alertColor, alertIcon: 'alert-circle', alertTitle: 'Error :' + resp.status, alertMessage: resp.statusText, onClose: () => setAlertVisible(false) });
            }
        } catch (error) {
            setLoading(false);
            setAlertVisible(true);
            setMessage({ ...message, alertIconColor: theme.alertColor, alertIcon: 'alert-circle', alertTitle: 'Error :', alertMessage: error.message, onClose: () => setAlertVisible(false) });
        }
    };
    const GetUserList = async () => {
        try {
            setLoading(true);
            const user = await getSessionData();
            const token = user.token;

            const resp = await fetch(`${API_URL}/api/User/GetUserList/${''}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (resp.ok) {
                let data = await resp.json();
                let filterData = data.filter(i => i.state === true);
                filterData.sort((a, b) => a.firstName.localeCompare(b.firstName));
                setListUser(filterData);
                setLoading(false);
            } else if (resp.status === 401) {
                setLoading(false)
                setAlertVisible(true);
                setMessage({ ...message, alertIconColor: theme.alertColor, alertIcon: 'alert-circle', alertTitle: 'Error', alertMessage: 'Su sesion ha expirado. Por favor ingrese nuevamente.', onClose: () => LogOut() });
            } else {
                setLoading(false);
                setAlertVisible(true);
                setMessage({ ...message, alertIconColor: theme.alertColor, alertIcon: 'alert-circle', alertTitle: 'Error :' + resp.status, alertMessage: resp.statusText, onClose: () => setAlertVisible(false) });
            }
        } catch (error) {
            setLoading(false);
            setAlertVisible(true);
            setMessage({ ...message, alertIconColor: theme.alertColor, alertIcon: 'alert-circle', alertTitle: 'Error :', alertMessage: error.message, onClose: () => setAlertVisible(false) });
        }
    };
    const GetCategories = async (userId) => {
        try {
            setLoading(true);
            const user = await getSessionData();
            const token = user.token;

            const resp = await fetch(`${API_URL}/api/Category/GetCategoryListByUserId/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (resp.ok) {
                let data = await resp.json();
                const parentL = data.filter((c) => c.parentId === null);
                const childL = parentL.flatMap((p) => p.children || []);
                setParentList(parentL);
                setChildList(childL);
                setLoading(false);
            }
            else if (resp.status === 401) {
                setLoading(false)
                setAlertVisible(true);
                setMessage({ ...message, alertIconColor: theme.alertColor, alertIcon: 'alert-circle', alertTitle: 'Error', alertMessage: 'Su sesion ha expirado. Por favor ingrese nuevamente.', onClose: () => LogOut() });
            }
            else {
                setLoading(false);
                setAlertVisible(true);
                setMessage({ ...message, alertIconColor: theme.alertColor, alertIcon: 'alert-circle', alertTitle: 'Error :' + resp.status, alertMessage: resp.statusText, onClose: () => setAlertVisible(false) });
            }
        } catch (error) {
            setLoading(false);
            setAlertVisible(true);
            setMessage({ ...message, alertIconColor: theme.alertColor, alertIcon: 'alert-circle', alertTitle: 'Error :', alertMessage: error.message, onClose: () => setAlertVisible(false) });
        }
    };
    const closeModals = () => {
        setIsDropdownOpen(false);
        setIsUserDropdownOpen(false);
        setCatDropdownOpen(false);
        setSubCatDropdownOpen(false);
    };
    const validFrm = async () => {
        if (!data.description) {
            setLoading(false);
            setAlertVisible(true);
            setIsTechModalOpen(false);
            inputRefs.descriptionInput.current?.focus();
            setMessage({ ...message, alertIconColor: theme.warningColor, alertIcon: 'alert-outline', alertTitle: 'Espera', alertMessage: 'Por favor, ingresa una descripción.', onClose: () => setAlertVisible(false) });
            return false;
        };
        if (data.description.length <= 5) {
            setLoading(false);
            setAlertVisible(true);
            setIsTechModalOpen(false);
            inputRefs.descriptionInput.current?.focus();
            setMessage({ ...message, alertIconColor: theme.warningColor, alertIcon: 'alert-outline', alertTitle: 'Espera', alertMessage: 'Por favor, ingresa una descripción válida.', onClose: () => setAlertVisible(false) });
            return false;
        };
        if (!data.userResponse) {
            setLoading(false);
            setAlertVisible(true);
            setIsTechModalOpen(false);
            inputRefs.UResponseInput.current?.focus();
            setMessage({ ...message, alertIconColor: theme.warningColor, alertIcon: 'alert-outline', alertTitle: 'Espera', alertMessage: 'Por favor, ingresa una respuesta al usuario.', onClose: () => setAlertVisible(false) });
            return false;
        };
        if (data.userResponse.length <= 5) {
            setLoading(false);
            setAlertVisible(true);
            setIsTechModalOpen(false);
            inputRefs.UResponseInput.current?.focus();
            setMessage({ ...message, alertIconColor: theme.warningColor, alertIcon: 'alert-outline', alertTitle: 'Espera', alertMessage: 'Por favor, ingresa una respuesta al usuario válida.', onClose: () => setAlertVisible(false) });
            return false;
        };
        if (!data.descriptionTech) {
            setLoading(false);
            setAlertVisible(true);
            inputRefs.descriptionTInput.current?.focus();
            setMessage({ ...message, alertIconColor: theme.warningColor, alertIcon: 'alert-outline', alertTitle: 'Espera', alertMessage: 'Por favor, ingresa la solución técnica.', onClose: () => setAlertVisible(false) });
            return false;
        };
        if (data.descriptionTech.length <= 5) {
            setLoading(false);
            setAlertVisible(true);
            inputRefs.descriptionTInput.current?.focus();
            setMessage({ ...message, alertIconColor: theme.warningColor, alertIcon: 'alert-outline', alertTitle: 'Espera', alertMessage: 'Por favor, ingresa una solución válida.', onClose: () => setAlertVisible(false) });
            return false;
        };
        return true;
    };
    const refreshProcess = () => {
        setData({
            ...data,
            id: 0,
            branchId: 0,
            userId: 0,
            categoryId: 0,
            subCatId: 0,
            title: '',
            description: '',
            userResponse: '',
            descriptionTech: ''
        })
        setShowSubCats(false);
        setShowCats(false);
        setShowUser(false);
        setSelectedBranch(null);
        setSelectedImg([]); // Limpia la lista de adjuntos
        setSelectedImgTech([]);
        setIsTechModalOpen(false);
        setAlertVisible(false);
        setSelectedIndex(() => ({
            Branch: null,
            Users: null,
            Cats: null,
            SubCats: null
        }));
    };
    const handleSubmit = async () => {
        setLoading(true);
        try {
            const isValid = await validFrm();
            if (isValid) {
                const user = await getSessionData();
                let request = {
                    id: 0,
                    branchId: data.branchId,
                    userAttendId: user.id,
                    userAttendEmail: user.email,
                    subCatId: data.subCatId,
                    processedBy: data.userId,
                    title: data.title,
                    description: data.description,
                    userResponse: data.userResponse,
                    sResponse: data.descriptionTech,
                    attachmentsUser: selectedImg ? selectedImg : [],
                    attachmentsTech: selectedImgTech ? selectedImgTech : []
                };
                const resp = await fetch(`${API_URL}/api/Ticket/CreateManualTicket`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Content-type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify(request)
                });

                if (resp.ok) {
                    return resp.json().then(data => {
                        if (data.code === 400) {
                            setAlertVisible(true);
                            setMessage({ ...message, alertIconColor: theme.alertColor, alertIcon: 'alert-circle', alertTitle: 'Espera', alertMessage: data.message, onClose: () => setAlertVisible(false) });
                        } else {
                            setAlertVisible(true);
                            setMessage({ ...message, alertIconColor: theme.succesColor, alertIcon: 'check-circle', alertTitle: 'Ticket registrado', alertMessage: 'Se proceso correctamente.', onClose: () => refreshProcess() });
                        }
                        setLoading(false)
                    })
                }
                else if (resp.status === 401) {
                    setLoading(false);
                    setAlertVisible(true);
                    setMessage({ ...message, alertIconColor: theme.alertColor, alertIcon: 'alert-circle', alertTitle: 'Error', alertMessage: 'Su sesion ha expirado. Por favor ingrese nuevamente.', onClose: () => LogOut() });
                }
                else {
                    setLoading(false)
                    setAlertVisible(true);
                    setMessage({ ...message, alertIconColor: theme.alertColor, alertIcon: 'alert-circle', alertTitle: 'Error', alertMessage: 'Error registrando el ticket.', onClose: () => setAlertVisible(false) });
                }
            }
        } catch (error) {
            setLoading(false)
            setAlertVisible(true);
            setMessage({ ...message, alertIconColor: theme.alertColor, alertIcon: 'alert-circle', alertTitle: 'Error', alertMessage: 'Error registrando el ticket.' + error.message, onClose: () => setAlertVisible(false) });
        }
    };
    useEffect(() => {
        GetBranchList();
        GetUserList();
    }, []);
    const renderDropdownButton = (selectedItem, isOpened, toggleModal, label, labelSM) => (
        <View>
            <Text style={theme.labelSm}>{labelSM}</Text>
            <TouchableOpacity style={theme.dropdownButtonStyle} onPress={toggleModal}>
                <Text style={theme.dropdownButtonTxtStyle}>
                    {labelSM === 'Oficinas' && (
                        <>
                            {selectedItem ? capitalizeFirstLetter(selectedItem.branchName) : label}
                        </>
                    )}
                    {labelSM === 'Usuarios' && (
                        <>
                            {selectedItem ? capitalizeFirstLetter(selectedItem?.firstName) + ' ' + capitalizeFirstLetter(selectedItem?.lastName) : label}
                        </>
                    )}
                    {labelSM === 'Categorías' && (
                        <>
                            {selectedItem ? capitalizeFirstLetter(selectedItem.categoryName) : label}
                        </>
                    )}
                    {labelSM === 'Sub-categorías' && (
                        <>
                            {selectedItem ? capitalizeFirstLetter(selectedItem.categoryName) : label}
                        </>
                    )}
                </Text>
                <FIcons name={isOpened ? 'chevron-up' : 'chevron-down'} style={theme.dropdownButtonArrowStyle} />
            </TouchableOpacity>
        </View>
    );
    const renderDropdownModal = (data, onSelect, isOpen, toggleModal, label, indexName) => (
        <Modal visible={isOpen} transparent={true} animationType="slide" onRequestClose={toggleModal} >
            <View style={theme.modalContainer}>
                <View style={theme.modalContent}>
                    <ScrollView>
                        {data.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={theme.modalItem}
                                onPress={() => {
                                    setSelectedIndex({ ...selectedIndex, [indexName]: index });
                                    onSelect(item, index);
                                    toggleModal();
                                }}
                            >
                                <View style={{ marginRight: 10 }}>
                                    <MIcons
                                        name={
                                            selectedIndex[indexName] === index
                                                ? "radiobox-marked"
                                                : "radiobox-blank"
                                        }
                                        size={20}
                                        color={selectedIndex[indexName] === index ? "#007bc1" : "#ccc"}
                                    />
                                </View>
                                {label === 'Oficinas' && (
                                    <>
                                        <Text style={theme.modalItemText}>{capitalizeFirstLetter(item?.branchName)}</Text>
                                    </>
                                )}
                                {label === 'Usuarios' && (
                                    <>
                                        <Text style={theme.modalItemText}>{capitalizeEachWord(item?.firstName) + ' ' + capitalizeEachWord(item?.lastName)}</Text>
                                    </>
                                )}
                                {label === 'Categorías' && (
                                    <>
                                        <Text style={theme.modalItemText}>{capitalizeFirstLetter(item?.categoryName)}</Text>
                                    </>
                                )}
                                {label === 'Sub-categorías' && (
                                    <>
                                        <Text style={theme.modalItemText}>{capitalizeFirstLetter(item?.categoryName)}</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <View style={{ marginTop: 20, alignItems: 'center' }}>
                        <TouchableOpacity style={theme.buttonCloseModal} onPress={() => closeModals()}>
                            <MIcons name="cancel" size={20} style={{ marginRight: 5 }} color={'#fff'} />
                            <Text style={{ color: '#fff' }}>
                                {'Cancelar'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
    const renderTechModal = (isOpen, toggleModal) => (
        <Modal visible={isOpen} transparent={true} animationType="slide" onRequestClose={toggleModal} >
            <View style={theme.modalContainer}>
                <View style={theme.modalContentTech}>
                    <ScrollView>
                        <View style={{ marginBottom: 20 }}>
                            <Text style={[theme.label, { textDecorationLine: 'underline' }]}>Solucion Técnica:</Text>
                        </View>
                        <Text style={theme.labelSm}>Descripción:</Text>
                        <View style={theme.inputContainer}>
                            <TextInput
                                ref={inputRefs.descriptionTInput}
                                style={data.descriptionTech.length > 5 ? theme.inputArea : theme.inputAreaAlert}
                                placeholder='Describe tu solución técnica en detalle...'
                                placeholderTextColor={colorScheme === 'dark' ? '#ccc' : '#999'}
                                value={data.descriptionTech}
                                onChangeText={(value) => setData({ ...data, descriptionTech: value })}
                                multiline={true}
                                numberOfLines={4}
                                textAlignVertical='top'
                                maxLength={550}
                            />
                        </View>
                        <AttachmentRow isTech={true} onSelectedImg={handleSelectedImg} onSelectedImgTech={handleSelectImgTech} />
                        <View style={{ paddingVertical: 10, flexDirection: 'row', justifyContent: 'center' }}>
                            {loading ? (
                                <ActivityIndicator size="large" color="#00939C" style={{ marginTop: 20 }} />
                            ) : (
                                <>
                                    <TouchableOpacity style={[theme.buttonCloseModal, { backgroundColor: '#00939C', marginRight: 20 }]} onPress={() => setIsTechModalOpen(!isTechmodalOpen)}>
                                        <FIcons name="arrow-left" size={20} color='#fff' />
                                        <Text style={{ color: '#fff', marginLeft: 10 }}>{'Regresar'}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[theme.buttonCloseModal]} onPress={handleSubmit}>
                                        <FIcons name="save" size={20} color='#fff' />
                                        <Text style={{ color: '#fff', marginLeft: 10 }}>{'Registrar'}</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

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
            <GestureHandlerRootView style={{ flex: 1 }}>
                <ScrollView style={theme.scrollView} contentContainerStyle={theme.scrollContent} keyboardShouldPersistTaps="handled" nestedScrollEnabled={true}>
                    <View style={theme.rowContainer}>
                        {listBranch.length > 0 ? (
                            <>
                                {renderDropdownButton(selectedBranch, isDropdownOpen, () => setIsDropdownOpen(!isDropdownOpen), 'Selecciona una oficina', 'Oficinas')}
                                {renderDropdownModal(listBranch, handleBranchSelect, isDropdownOpen, () => setIsDropdownOpen(!isDropdownOpen), 'Oficinas', 'Branch')}
                            </>
                        ) : (
                            <Text style={theme.label}>Cargando datos...</Text>
                        )}
                        {showUser && (
                            <>
                                {renderDropdownButton(selectedUser, isUserDropdownOpen, () => setIsUserDropdownOpen(!isUserDropdownOpen), 'Selecciona un usuario', 'Usuarios')}
                                {renderDropdownModal(listUserF, handleUserSelect, isUserDropdownOpen, () => setIsUserDropdownOpen(!isUserDropdownOpen), 'Usuarios', 'Users')}
                            </>
                        )}
                    </View>
                    {showCats && (
                        <>
                            <View style={theme.rowContainer}>
                                {listBranch.length > 0 ? (
                                    <>
                                        {renderDropdownButton(selectedCat, isCatDropdownOpen, () => setCatDropdownOpen(!isCatDropdownOpen), 'Selecciona una categoría', 'Categorías')}
                                        {renderDropdownModal(parentList, handleCatSelect, isCatDropdownOpen, () => setCatDropdownOpen(!isCatDropdownOpen), 'Categorías', 'Cats')}
                                    </>
                                ) : (
                                    <Text style={theme.label}>Cargando datos...</Text>
                                )}
                                {showSubCats && (
                                    <>
                                        {renderDropdownButton(selectedSubCat, isSubCatDropdownOpen, () => setSubCatDropdownOpen(!isSubCatDropdownOpen), 'Sub-categoría', 'Sub-categorías')}
                                        {renderDropdownModal(childListF, handleSubCatSelect, isSubCatDropdownOpen, () => setSubCatDropdownOpen(!isSubCatDropdownOpen), 'Sub-categorías', 'SubCats')}
                                    </>
                                )}
                            </View>
                        </>
                    )}
                    {data.subCatId > 0 && (
                        <>
                            <Text style={theme.labelSm}>Título:</Text>
                            <Text style={theme.txtTitle}><Text style={{ fontWeight: '500' }}>{data.title}</Text></Text>

                            <Text style={theme.labelSm}>Descripción:</Text>
                            <View style={theme.inputContainer}>
                                <TextInput
                                    ref={inputRefs.descriptionInput}
                                    style={data.description.length > 5 ? theme.inputArea : theme.inputAreaAlert}
                                    placeholder='Describe el problema o situacion en detalle...'
                                    placeholderTextColor={colorScheme === 'dark' ? '#ccc' : '#999'}
                                    value={data.description}
                                    onChangeText={(value) => setData({ ...data, description: value })}
                                    multiline={true}
                                    numberOfLines={4}
                                    textAlignVertical='top'
                                    maxLength={550}
                                />
                            </View>
                            <View style={{ marginTop: 10 }}>
                                <Text style={theme.labelSm}>Respuesta al usuario:</Text>
                                <View style={theme.inputContainer}>
                                    <TextInput
                                        ref={inputRefs.UResponseInput}
                                        style={data.userResponse.length > 5 ? theme.inputArea : theme.inputAreaAlert}
                                        placeholder='Describe tu respuesta al usuario...'
                                        placeholderTextColor={colorScheme === 'dark' ? '#ccc' : '#999'}
                                        value={data.userResponse}
                                        onChangeText={(value) => setData({ ...data, userResponse: value })}
                                        multiline={true}
                                        numberOfLines={4}
                                        textAlignVertical='top'
                                        maxLength={550}
                                    />
                                </View>
                            </View>
                            <AttachmentRow isTech={false} onSelectedImg={handleSelectedImg} onSelectedImgTech={handleSelectImgTech} />
                            <View style={theme.rowContainer}>
                                {loading ? (
                                    <ActivityIndicator size="large" color="#00939C" style={{ marginTop: 20 }} />
                                ) : (
                                    <TouchableOpacity style={theme.btnSend} onPress={() => setIsTechModalOpen(!isTechmodalOpen)}>
                                        <FIcons name="arrow-right" size={20} color='#fff' />
                                        <Text style={{ color: '#fff', marginLeft: 10, fontWeight: 600 }}>Continuar</Text>
                                    </TouchableOpacity>
                                )}

                            </View>
                            <View style={theme.rowContainer}>
                                <>
                                    {renderTechModal(isTechmodalOpen, () => setIsTechModalOpen(!isTechmodalOpen))}
                                </>
                            </View>
                        </>
                    )}
                </ScrollView>
            </GestureHandlerRootView>
        </>
    )
}

export default SupportRegister;