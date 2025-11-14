import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";

import {
  getEventsCreatedByUser,
  getEventsUserWillAttend,
} from "../../lib/models/events";

type EventItem = {
  id: number;
  name: string;
  place: string;
  start_date: string;
  start_time: string;
  category_name?: string;
  attendees_count?: number;
};

export default function ProfileScreen() {
  const params = useLocalSearchParams<{ name?: string; email?: string }>();

  const displayName = params.name || "Usuario";
  const [email, setEmail] = useState(params.email || "correo@ejemplo.com");
  const [community, setCommunity] = useState("Comunidad Las Brisas");
  const [aboutMe, setAboutMe] = useState(
    "Aquí va la descripción del usuario."
  );

  const [isEditing, setIsEditing] = useState(false);

  const [createdEvents, setCreatedEvents] = useState<EventItem[]>([]);
  const [attendingEvents, setAttendingEvents] = useState<EventItem[]>([]);
  const [selectedTab, setSelectedTab] =
    useState<"created" | "attending">("created");

  const [loading, setLoading] = useState(true);

  const userId = email;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const created = await getEventsCreatedByUser(userId);
        const attending = await getEventsUserWillAttend(userId);

        setCreatedEvents(created);
        setAttendingEvents(attending);
      } catch (err) {
        console.log("Error cargando eventos:", err);
        Alert.alert(
          "Error",
          "Hubo un problema cargando tu información desde SQLite."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  function formatDateLabel(iso: string) {
    try {
      const [y, m, d] = iso.split("-");
      const date = new Date(Number(y), Number(m) - 1, Number(d));
      const day = String(date.getDate()).padStart(2, "0");
      const monthStr = date
        .toLocaleDateString("es-ES", { month: "short" })
        .toUpperCase();
      return { day, monthStr };
    } catch {
      return { day: "??", monthStr: "??" };
    }
  }

  const currentEvents =
    selectedTab === "created" ? createdEvents : attendingEvents;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <View style={styles.menuIcon}>
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
        </View>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
      </View>

      {/* NOMBRE */}
      <View style={styles.nameRow}>
        <Text style={styles.nameText}>{displayName.toUpperCase()}</Text>

        <TouchableOpacity
          onPress={() => setIsEditing(!isEditing)}
          style={styles.editBadge}
        >
          <Text style={styles.editBadgeText}>
            {isEditing ? "Guardar" : "Editar"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* TARJETA PERFIL */}
      <View style={styles.card}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarInitial}>
            {displayName.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          {isEditing ? (
            <>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Correo"
              />
              <TextInput
                style={styles.input}
                value={community}
                onChangeText={setCommunity}
                placeholder="Comunidad"
              />
            </>
          ) : (
            <>
              <Text style={styles.contactText}>{email}</Text>
              <Text style={styles.contactText}>{community}</Text>
            </>
          )}
        </View>
      </View>

      {/* SOBRE MÍ */}
      <Text style={styles.sectionTitle}>SOBRE MÍ</Text>

      <View style={styles.textCard}>
        {isEditing ? (
          <TextInput
            style={styles.aboutInput}
            value={aboutMe}
            multiline
            onChangeText={setAboutMe}
          />
        ) : (
          <Text style={styles.aboutText}>{aboutMe}</Text>
        )}
      </View>

      {/* MIS EVENTOS */}
      <Text style={styles.sectionTitle}>MIS EVENTOS</Text>

      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === "created" && styles.tabButtonActive,
          ]}
          onPress={() => setSelectedTab("created")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "created" && styles.tabTextActive,
            ]}
          >
            Creados ({createdEvents.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === "attending" && styles.tabButtonActive,
          ]}
          onPress={() => setSelectedTab("attending")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "attending" && styles.tabTextActive,
            ]}
          >
            Asistiré ({attendingEvents.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#7AC943" />}

      {!loading && currentEvents.length === 0 && (
        <Text style={styles.emptyEvents}>No hay eventos.</Text>
      )}

      {!loading &&
        currentEvents.map((ev) => {
          const { day, monthStr } = formatDateLabel(ev.start_date);

          return (
            <View key={ev.id} style={styles.eventCard}>
              <View style={styles.eventDateBox}>
                <Text style={styles.eventDay}>{day}</Text>
                <Text style={styles.eventMonth}>{monthStr}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.eventTitle}>{ev.name}</Text>
                <Text style={styles.eventSubText}>
                  {ev.start_time} · {ev.place}
                </Text>
                <Text style={styles.eventSubText}>
                  {ev.category_name} · {ev.attendees_count} vecinos asistirán
                </Text>
              </View>
            </View>
          );
        })}
    </ScrollView>
  );
}

const PURPLE = "#7E57C2";
const GREEN = "#7AC943";
const LIGHT_BG = "#F7F7F7";

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: LIGHT_BG },
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },

  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  menuIcon: {
    width: 32,
    height: 32,
    backgroundColor: GREEN,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  menuLine: {
    width: 18,
    height: 2,
    backgroundColor: "white",
    marginVertical: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: "600" },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  nameText: { fontSize: 18, color: PURPLE, fontWeight: "700" },

  editBadge: {
    backgroundColor: "#FFE0B2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  editBadgeText: { color: "#E65100", fontSize: 12, fontWeight: "600" },

  card: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 10,
    marginBottom: 24,
  },

  avatarBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: GREEN,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarInitial: { fontSize: 24, color: "white", fontWeight: "700" },

  contactText: { fontSize: 14, color: "#555" },

  input: {
    backgroundColor: "#F3F3F3",
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 14,
    color: PURPLE,
    fontWeight: "700",
    marginBottom: 8,
  },

  textCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 10,
    marginBottom: 24,
  },

  aboutText: { fontSize: 14, lineHeight: 20 },
  aboutInput: { minHeight: 100, fontSize: 14 },

  tabsRow: { flexDirection: "row", marginBottom: 12 },
  tabButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: GREEN,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
    marginRight: 8,
  },
  tabButtonActive: { backgroundColor: GREEN },

  tabText: { color: GREEN, fontWeight: "600" },
  tabTextActive: { color: "white" },

  emptyEvents: { color: "#777", textAlign: "center", marginTop: 8 },

  eventCard: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
  },

  eventDateBox: {
    width: 60,
    backgroundColor: GREEN,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  eventDay: { fontSize: 18, fontWeight: "700", color: "white" },
  eventMonth: { fontSize: 12, fontWeight: "600", color: "white" },

  eventTitle: { fontWeight: "600", fontSize: 15 },
  eventSubText: { color: "#666", fontSize: 12 },
});