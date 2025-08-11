import React from "react";
import { useNavigation } from "expo-router";
import MenuScreen from "./components/menuScreen";
import { setToken } from "./db/database";

const Home = () => {
  const navigation = useNavigation();

  const LogOut = async () => {
    await setToken(null);
    navigation.reset({
      index: 0,
      routes: [{ name: "index" }],
    });
  };
  const navigateToScreen = (screenName) => {
    navigation.navigate(screenName);
  };

  return <MenuScreen navigateToScreen={navigateToScreen} LogOut={LogOut} />;
};
export default Home;
