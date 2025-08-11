import { View, Text, TextInput, ScrollView, FlatList, Dimensions, useColorScheme, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { cargarClientes } from '../db/database';
import { lightTheme, darkTheme } from '../utils/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


const clientes = ({ resetLayout }) => {

    const [clientes, setClientes] = useState([]);
    const [filteredClientes, setFilteredClientes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

    useEffect(() => {
        cargarClientes()
            .then((data) => {
                setClientes(data);
                setFilteredClientes(data.slice(0, 15));
            })
            .catch((error) => console.error(error));
    }, []);
    const seleccionarCliente = (cliente) => {
        resetLayout(cliente.numeroPrestamo, cliente.cliente, cliente.dni, cliente.estado, cliente.producto, cliente.cuotasAtraso, cliente.monto, cliente.saldoCapital, cliente.capitalVencido, cliente.mora, cliente.saldoInteres, cliente.avales);
    };
    const handleSearch = (query) => {
        setSearchQuery(query);
        // Convertir la consulta a minúsculas para hacer una búsqueda insensible a mayúsculas y minúsculas
        const lowerCaseQuery = query.toLowerCase();

        const filtered = clientes.filter((cliente) =>
            cliente.cliente.toLowerCase().includes(lowerCaseQuery) ||
            cliente.numeroPrestamo.toLowerCase().includes(lowerCaseQuery) ||
            cliente.dni.toLowerCase().includes(lowerCaseQuery)
        ).slice(0, 10); // Limita los resultados a los primeros 10 elementos
        setFilteredClientes(filtered);
    };
    const renderItem = ({ item }) => (
        <View style={theme.row}>
            <View style={theme.actionCell}>
                <TouchableOpacity style={theme.buttonSelect} onPress={() => seleccionarCliente(item)}>
                    <Icon name="hand-pointing-right" size={20} color="white" />
                </TouchableOpacity>
            </View>
            <Text style={theme.cell}>{item.cliente}</Text>
            <Text style={theme.cell}>{item.dni}</Text>
            <Text style={theme.cell}>{item.numeroPrestamo}</Text>
            <Text style={theme.cell}>{item.monto}</Text>
            <Text style={theme.cell}>{item.producto}</Text>
            <Text style={theme.cell}>{item.estado}</Text>
            <Text style={theme.cell}>{item.adjudicado}</Text>
            <Text style={theme.cell}>{item.oficina}</Text>
        </View>
    );
    const keyExtractor = (item) => {
        return item.secuencial ? item.secuencial.toString() : Math.random().toString();
    };
    const windowWidth = Dimensions.get('window').width;
    return (
        <>
            <KeyboardAwareScrollView
                style={theme.containerClient}
                resetScrollToCoords={{ x: 0, y: 0 }}
                contentContainerStyle={theme.contentContainer}
                scrollEnabled={true}
            >
                <View style={theme.inputSearchContainer}>
                    <TextInput
                        style={theme.inputSearch}
                        placeholder="Buscar cliente..."
                        placeholderTextColor={colorScheme === 'dark' ? '#ccc' : '#999'}
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                </View>

                <View style={{ flex: 1, padding: 10 }}>
                    <ScrollView horizontal>
                        <View style={{ width: windowWidth * 5 }}>
                            <View style={theme.headerRow}>
                                <Text style={theme.actionHeaderCell}>Seleccionar</Text>
                                <Text style={theme.headerCell}>Cliente</Text>
                                <Text style={theme.headerCell}>DNI</Text>
                                <Text style={theme.headerCell}>Núm. Préstamo</Text>
                                <Text style={theme.headerCell}>Monto</Text>
                                <Text style={theme.headerCell}>Producto</Text>
                                <Text style={theme.headerCell}>Estado</Text>
                                <Text style={theme.headerCell}>Adjudicado</Text>
                                <Text style={theme.headerCell}>Oficina</Text>
                            </View>
                            {filteredClientes && (
                                <FlatList
                                    data={filteredClientes}
                                    keyExtractor={keyExtractor}
                                    renderItem={renderItem}
                                />
                            )}

                        </View>
                    </ScrollView>
                </View>
            </KeyboardAwareScrollView>
        </>


    )
}
export default clientes