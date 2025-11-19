import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { attendEvent } from "../../lib/models/events";

const USER_ID = "1"; 

type EventDetailParams = {
  id?: string;
  title?: string;
  place?: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  description?: string;
  category_name?: string;
};

export default function EventDetailScreen() {
  const params = useLocalSearchParams<EventDetailParams>();
  const {
    id,
    title,
    place,
    start_date,
    end_date,
    start_time,
    end_time,
    description,
    category_name,
  } = params;

  const [joining, setJoining] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const handleJoin = async () => {
    if (!id) {
      Alert.alert("Error", "El evento no es válido.");
      return;
    }

    try {
      setJoining(true);

      await attendEvent(Number(id), USER_ID);
      Alert.alert("Éxito", "Te has unido al evento.");
    } catch (error) {
      console.error("Error al unirse al evento:", error);
      Alert.alert("Error", "No fue posible unirte al evento.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* MENÚ LATERAL */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.sideMenu}>
            <Text style={styles.menuTitle}>Menú</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push("/(tabs)/home");
              }}
            >
              <Text style={styles.menuItemText}>Inicio</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push("/(tabs)/categories");
              }}
            >
              <Text style={styles.menuItemText}>Categorías</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push("/(tabs)/events");
              }}
            >
              <Text style={styles.menuItemText}>Eventos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push("/(tabs)/profile");
              }}
            >
              <Text style={styles.menuItemText}>Mi perfil</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
        >
          <View style={styles.menuIconLine} />
          <View style={styles.menuIconLine} />
          <View style={styles.menuIconLine} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {title ?? "Detalle del evento"}
        </Text>
      </View>

      {/* CONTENIDO */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.fieldLabel}>Fecha</Text>
        <Text style={styles.fieldValue}>
          {start_date ?? "-"}
          {end_date && end_date !== start_date ? ` a ${end_date}` : ""}
        </Text>

        <Text style={styles.fieldLabel}>Hora</Text>
        <Text style={styles.fieldValue}>
          {start_time ?? "-"}
          {end_time ? ` - ${end_time}` : ""}
        </Text>

        <Text style={styles.fieldLabel}>Lugar</Text>
        <Text style={styles.fieldValue}>{place ?? "-"}</Text>

        <Text style={styles.fieldLabel}>Categoría</Text>
        <Text style={styles.fieldValue}>{category_name ?? "-"}</Text>

        <Text style={styles.fieldLabel}>Sobre el evento</Text>
        <Text style={styles.fieldValue}>{description || "Sin descripción."}</Text>

        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleJoin}
            disabled={joining}
          >
            <Text style={styles.primaryButtonText}>
              {joining ? "Uniéndote..." : "Unirme al evento"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryButtonText}>Regresar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827AA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
  },
  menuButton: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuIconLine: {
    width: 24,
    height: 3,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    marginVertical: 2,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    backgroundColor: "rgba(255,255,255,0.94)",
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#7C3AED",
    marginBottom: 4,
    marginTop: 12,
  },
  fieldValue: {
    fontSize: 16,
    color: "#111827",
  },
  buttonsRow: {
    flexDirection: "row",
    marginTop: 32,
    columnGap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#22C55E",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#22C55E",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#16A34A",
    fontSize: 16,
    fontWeight: "600",
  },

  // menú lateral
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    flexDirection: "row",
  },
  sideMenu: {
    width: "70%",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#111827",
  },
  menuItem: {
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: "#4B5563",
  },
});