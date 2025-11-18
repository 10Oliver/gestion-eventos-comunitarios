import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SideMenu from "./SideMenu";

export default function Header() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setOpen(true)}>
          <Ionicons name="menu-outline" size={28} color="#7CC56F" />
        </TouchableOpacity>

        <Text style={styles.title}>Inicio</Text>

        <View style={{ width: 28 }} />
      </View>

      {/* Drawer Menu */}
      <SideMenu open={open} close={() => setOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    justifyContent: "space-between",
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
});
