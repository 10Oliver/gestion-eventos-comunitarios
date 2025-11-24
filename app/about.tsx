import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import TopBar from "./components/TopBar";

export default function AboutScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#fafafa" }}>
      <TopBar title="Acerca de la App" />

      <ScrollView contentContainerStyle={styles.container}>
        
        {/* TARJETA PRINCIPAL */}
        <View style={styles.card}>
          <Text style={styles.title}>Sobre este proyecto</Text>

          <Text style={styles.text}>
            Esta aplicación ha sido desarrollada como parte de un proyecto académico
            orientado a fortalecer la participación comunitaria mediante actividades,
            talleres y eventos locales.
          </Text>

          <Text style={styles.text}>
            Permite explorar eventos, inscribirse, descubrir categorías y conectar a 
            los usuarios con iniciativas cercanas en su comunidad.
          </Text>

          <Text style={styles.license}>
            Esta obra está bajo una licencia:
            {"\n"}Creative Commons — CC BY-NC 4.0
            {"\n"}(Atribución – No Comercial)
          </Text>
        </View>

        {/* ESPACIO */}
        <View style={{ height: 30 }} />

        {/* BOTÓN REGRESAR */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/home")}
        >
          <Ionicons name="arrow-back-outline" size={20} color="#6A40E4" />
          <Text style={styles.backText}>Regresar al Inicio</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },

  /* Tarjeta estilo Home/Events */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#6A40E4",
    marginBottom: 12,
  },

  text: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
    marginBottom: 12,
  },

  license: {
    fontSize: 13,
    color: "#444",
    backgroundColor: "#f1f1f1",
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    lineHeight: 20,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#6A40E4",
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: "center",
  },

  backText: {
    marginLeft: 8,
    color: "#6A40E4",
    fontWeight: "700",
    fontSize: 15,
  },
});
