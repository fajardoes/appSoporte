import React, { useState } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Menu, Avatar, Divider } from 'react-native-paper';
import MCIcons from '@expo/vector-icons/MaterialCommunityIcons';


const ProfileMenu = ({ handleProfile, handleLogout, theme }) => {
    const [visible, setVisible] = useState(false);

const toggleMenu = () => {
    console.log(visible)
    setVisible(!visible)
}

    return (
        <Menu
            visible={visible}
            onDismiss={toggleMenu}
            style= {{marginTop: 40}}           
            anchor={
                <TouchableOpacity onPress={toggleMenu} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Avatar.Text
                        size={36}
                        label={<MCIcons name="menu" size={20} color="white" />}
                        style={{ backgroundColor: theme.menuColor }}
                    />
                </TouchableOpacity>
            }
        >
            <Menu.Item
                onPress={() => {
                    toggleMenu();
                    handleProfile();
                }}
                title="Perfil"
                leadingIcon={() => (
                    <MCIcons 
                    name='account'
                    size={20}
                    color={theme.themeText}
                    />
                )}
                style={theme.menuText}

            />
            <Divider />
            <Menu.Item
                onPress={() => {
                    toggleMenu();
                    handleLogout();
                }}
                title="Salir"
                leadingIcon={() => (
                    <MCIcons 
                    name='logout'
                    size={20}
                    color={theme.alertColor}
                    />
                )}
                style={theme.menuText}
            />
        </Menu>
    );
};

export default ProfileMenu;
