import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";

export default function Home() {
  const { name } = useLocalSearchParams<{ name?: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        ¡Hola{ name ? `, ${name}` : "" }! 👋
      </Text>
      <Text style={styles.subtitle}>
        Aquí tienes un resumen de tu comunidad:
      </Text>

      {/* Tarjeta Mi Perfil */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/profile")}
      >
        <Text style={styles.cardTitle}>Mi Perfil</Text>
        <Text style={styles.cardText}>
          Ver y editar tus datos, descripción y eventos creados.
        </Text>
      </TouchableOpacity>

      {/* Tarjeta Categorías */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/categories")}
      >
        <Text style={styles.cardTitle}>Categorías</Text>
        <Text style={styles.cardText}>
          Explora las categorías de eventos (deportes, arte, talleres, etc.).
        </Text>
      </TouchableOpacity>

      {/* Tarjeta Mis eventos */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/events")}
      >
        <Text style={styles.cardTitle}>Eventos</Text>
        <Text style={styles.cardText}>
          Revisa los próximos eventos y los que asistirás.
        </Text>
      </TouchableOpacity>

      {/* Tarjeta Crear evento */}
      <TouchableOpacity
        style={[styles.card, styles.primaryCard]}
        onPress={() => router.push("/events/create")}
      >
        <Text style={[styles.cardTitle, styles.primaryCardTitle]}>
          Crear nuevo evento
        </Text>
        <Text style={[styles.cardText, styles.primaryCardText]}>
          Comparte una nueva actividad con tu comunidad.
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  primaryCard: {
    backgroundColor: "#6AC24B", 
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardText: {
    fontSize: 13,
    color: "#555",
  },
  primaryCardTitle: {
    color: "#fff",
  },
  primaryCardText: {
    color: "#fdfdfd",
  },
});
