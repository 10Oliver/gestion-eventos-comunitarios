import React, { useEffect, useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import TopBar from "../components/TopBar";

import { attendEvent, getEventDetail } from "../../lib/models/events";

const USER_ID = "1";

export default function EventDetailScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    title?: string;
    place?: string;
    start_date?: string;
    start_time?: string;
    end_time?: string;
    description?: string;
    category_name?: string;
    organizer_id?: string;
    attendees_count?: string;
  }>();

  const {
    id,
    title,
    place,
    start_date,
    start_time,
    end_time,
    description,
    category_name,
    attendees_count
  } = params;

  const [joining, setJoining] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const [event, setEvent] = useState<any>(null);
  const [organizer, setOrganizer] = useState<string>("No disponible");
  const [attendeesCount, setAttendeesCount] = useState<number>(0);



  /* --------------------- CARGA DESDE SQLITE ---------------------- */
  useEffect(() => {
    if (!id) return;

    const loadDetail = async () => {
      try {
        const detail = await getEventDetail(Number(id));
        if (!detail) return;

        // Data real desde SQLite
        setEvent(detail.event);
        setOrganizer(detail.createdBy?.name || "No disponible");
        setAttendeesCount(detail.attendeesCount);
      } catch (e) {
        console.error("Error loading event detail:", e);
      }
    };

    loadDetail();
  }, [id]);

  /* --------------------- UNIRSE AL EVENTO ---------------------- */
  const handleJoin = async () => {
    if (!id) return;

    try {
      setJoining(true);
      await attendEvent(Number(id), USER_ID);

      // Refrescar datos desde SQLite
      const detail = await getEventDetail(Number(id));
      if (detail) {
        setAttendeesCount(detail.attendeesCount);
      }

      Alert.alert("¡Éxito!", "Te has unido al evento.");
    } catch (e) {
      Alert.alert("Error", "No fue posible unirse al evento.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <TopBar title="Evento" />

      {/* ---------------- CONTENT ---------------- */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* CARD PRINCIPAL */}
        <View style={styles.eventCard}>
          <View style={styles.dateBox}>
            <Text style={styles.dateDay}>{start_date?.split("-")[2]}</Text>
            <Text style={styles.dateMonth}>
              {new Date(start_date ?? "").toLocaleString("es-ES", {
                month: "short",
              }).toUpperCase()}
            </Text>
          </View>

          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.titleCard}>{title}</Text>

            <View style={styles.row}>
              <Ionicons name="time-outline" size={16} color="#8A8A8A" />
              <Text style={styles.cardInfo}>
                {start_time} - {end_time}
              </Text>
            </View>

            <View style={styles.row}>
              <Ionicons name="location-outline" size={16} color="#8A8A8A" />
              <Text style={styles.cardInfo}>{place}</Text>
            </View>

            <View style={styles.row}>
              <Ionicons name="grid-outline" size={16} color="#8A8A8A" />
              <Text style={styles.cardInfo}>{category_name}</Text>
            </View>
          </View>
        </View>

        {/* ORGANIZADOR */}
        <Text style={styles.sectionTitle}>ORGANIZADO POR</Text>
        <Text style={styles.sectionSubtitle}>{organizer}</Text>

        {/* SOBRE EL EVENTO */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>SOBRE EL EVENTO</Text>

          <View style={styles.categoryChip}>
            <Text style={styles.categoryChipText}>{category_name}</Text>
          </View>
        </View>

        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionText}>
            {description || "Este evento no tiene descripción."}
          </Text>
        </View>

        {/* PARTICIPANTES */}
        <View style={styles.attendeesBtn}>
          <Ionicons name="people-outline" size={18} color="#fff" />
          <Text style={styles.attendeesText}>
            {attendees_count} vecino(s) asistirán
          </Text>
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* ---------------- BOTONES INFERIORES ---------------- */}
      <View style={styles.footerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>Regresar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.joinButton}
          onPress={handleJoin}
          disabled={joining}
        >
          <Text style={styles.joinButtonText}>
            {joining ? "Uniendo..." : "Unirme"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* MENÚ LATERAL */}
      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.menuOverlay}
          onPressOut={() => setMenuVisible(false)}
        >
          <View style={styles.sideMenu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push("/home");
              }}
            >
              <Text style={styles.menuItemText}>Inicio</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push("/categories");
              }}
            >
              <Text style={styles.menuItemText}>Categorías</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push("/events");
              }}
            >
              <Text style={styles.menuItemText}>Eventos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push("/profile");
              }}
            >
              <Text style={styles.menuItemText}>Mi Perfil</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

/* ---------------------------- ESTILOS ---------------------------- */

const styles = StyleSheet.create({
  content: {
    padding: 20,
  },
  eventCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    elevation: 3,
    marginBottom: 26,
  },
  dateBox: {
    width: 64,
    height: 80,
    backgroundColor: "#6BCB3C",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  dateDay: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  dateMonth: { color: "#fff", fontSize: 14, fontWeight: "600" },
  titleCard: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  cardInfo: { marginLeft: 6, fontSize: 14, color: "#555" },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#7B3AED",
    marginTop: 8,
  },
  sectionSubtitle: { fontSize: 15, color: "#333", marginBottom: 16 },

  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  categoryChip: {
    backgroundColor: "#6BCB3C",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  categoryChipText: { color: "#fff", fontWeight: "600" },

  descriptionBox: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    elevation: 2,
    marginBottom: 20,
  },
  descriptionText: { fontSize: 14, color: "#333" },

  attendeesBtn: {
    backgroundColor: "#22C55E",
    flexDirection: "row",
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    columnGap: 8,
  },
  attendeesText: { color: "#fff", fontWeight: "700" },

  footerRow: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
    columnGap: 12,
  },

  backButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#22C55E",
    paddingVertical: 14,
    borderRadius: 12,
  },
  backText: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
    color: "#22C55E",
  },

  joinButton: {
    flex: 1,
    backgroundColor: "#FF7A45",
    paddingVertical: 14,
    borderRadius: 12,
  },
  joinButtonText: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },

  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sideMenu: {
    width: "70%",
    backgroundColor: "#fff",
    padding: 22,
    paddingTop: 60,
  },
  menuItem: { paddingVertical: 14 },
  menuItemText: { fontSize: 18, color: "#333" },
});
