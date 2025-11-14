import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";

const CATEGORIES = [
  { id: "1", name: "Deportes", description: "Eventos y actividades deportivas" },
  { id: "2", name: "Cultura", description: "Arte, música, exposiciones" },
  { id: "3", name: "Talleres", description: "Capacitaciones y charlas" },
];

export default function CategoriesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Categorías</Text>
      <Text style={styles.subtitle}>
        Explora las diferentes actividades y eventos planificados.
      </Text>

      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardText}>{item.description}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 13, color: "#666", marginBottom: 8 },
  card: {
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    padding: 14,
    marginBottom: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  cardText: { fontSize: 13, color: "#555" },
});