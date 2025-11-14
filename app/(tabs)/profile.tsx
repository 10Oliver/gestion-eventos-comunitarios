import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  getEventsCreatedByUser,
  getEventsUserWillAttend,
  type EventWithMeta,
} from "../../lib/models/events";

export default function ProfileScreen() {

  const [email, setEmail] = useState("porejemplo@abc.com");
  const [community, setCommunity] = useState("Comunidad Prusia");
  const [aboutMe, setAboutMe] = useState("Ejemplo de información");
  const [isEditing, setIsEditing] = useState(false);

  const [createdEvents, setCreatedEvents] = useState<EventWithMeta[]>([]);
  const [attendingEvents, setAttendingEvents] = useState<EventWithMeta[]>([]);
  const [selectedTab, setSelectedTab] = useState<"created" | "attending">(
    "created"
  );

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

  const formatDateTime = (e: EventWithMeta) => {
    const date = e.start_date ?? "";
    const [year, month, day] = date.split("-");
    const dateLabel =
      day && month ? `${day}/${month}` : e.start_date ?? "Sin fecha";

    const timeLabel =
      e.start_time && e.end_time
        ? `${e.start_time} – ${e.end_time}`
        : e.start_time ?? "";

    return { dateLabel, timeLabel };
  };

  const currentList =
    selectedTab === "created" ? createdEvents : attendingEvents;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() =>
            Alert.alert("Menú", "Aquí podrías abrir un menú lateral.")
          }
        >
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
        </TouchableOpacity>

      <Text style={styles.headerTitle}>Mi Perfil</Text>
      </View>

      {/* USUARIO */}
      <Text style={styles.sectionLabel}>USUARIO</Text>

      <View style={styles.userCard}>
        {/* Avatar */}
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {email[0]?.toUpperCase() ?? "U"}
          </Text>
        </View>

        <View style={styles.userInfo}>
          <TextInput
            style={styles.userEmail}
            value={email}
            editable={isEditing}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.communityInput}
            value={community}
            editable={isEditing}
            onChangeText={setCommunity}
            placeholder="Tu comunidad"
          />
        </View>

        <TouchableOpacity
          style={styles.editChip}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Text style={styles.editChipText}>
            {isEditing ? "Guardar" : "Editar"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* SOBRE MI */}
      <Text style={styles.sectionLabel}>SOBRE MÍ</Text>

      <View style={styles.aboutCard}>
        <TextInput
          style={styles.aboutInput}
          value={aboutMe}
          multiline
          editable={isEditing}
          onChangeText={setAboutMe}
        />
      </View>

      {/* EVENTOS */}
      <Text style={styles.sectionLabel}>MIS EVENTOS</Text>

      {/* BOTONES TABS */}
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
              styles.tabButtonText,
              selectedTab === "created" && styles.tabButtonTextActive,
            ]}
          >
            Creados ({createdEvents.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === "attending" && styles.tabButtonActiveOutline,
          ]}
          onPress={() => setSelectedTab("attending")}
        >
          <Text
            style={[
              styles.tabButtonText,
              selectedTab === "attending" && styles.tabButtonTextOutlineActive,
            ]}
          >
            Asistiré ({attendingEvents.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* LISTA DE EVENTOS */}
      {loading ? (
        <Text style={styles.emptyText}>Cargando…</Text>
      ) : currentList.length === 0 ? (
        <Text style={styles.emptyText}>No hay eventos.</Text>
      ) : (
        currentList.map((e, index) => {
          const { dateLabel, timeLabel } = formatDateTime(e);

          return (
            <View
              key={String(e.id ?? `${e.name}-${index}`)}
              style={styles.eventCard}
            >
              <View style={styles.dateBox}>
                <Text style={styles.dateDay}>{dateLabel}</Text>
              </View>

              <View style={styles.eventInfo}>
                <Text style={styles.eventName}>{e.name}</Text>
                {!!timeLabel && <Text style={styles.eventMeta}>{timeLabel}</Text>}
                {!!e.place && <Text style={styles.eventMeta}>{e.place}</Text>}
                {!!e.category_name && (
                  <Text style={styles.eventCategory}>{e.category_name}</Text>
                )}
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFF" },
  content: { paddingHorizontal: 24, paddingBottom: 50 },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#7CC84E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuLine: {
    width: 20,
    height: 2,
    backgroundColor: "#FFF",
    marginVertical: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
  },

  sectionLabel: {
    marginTop: 15,
    marginBottom: 6,
    color: "#7A3EB0",
    fontWeight: "700",
    fontSize: 14,
  },

  userCard: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
  },
  avatarCircle: {
    width: 55,
    height: 55,
    borderRadius: 14,
    backgroundColor: "#7CC84E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFF",
  },
  userInfo: { flex: 1 },
  userEmail: { fontWeight: "600", fontSize: 14, marginBottom: 4 },
  communityInput: { fontSize: 13, color: "#555" },

  editChip: {
    backgroundColor: "#FF9C57",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  editChipText: { color: "#FFF", fontWeight: "700", fontSize: 12 },

  aboutCard: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    elevation: 3,
  },
  aboutInput: {
    minHeight: 60,
    fontSize: 14,
    color: "#444",
  },

  tabsRow: { flexDirection: "row", marginTop: 10, marginBottom: 12 },
  tabButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#7CC84E",
    paddingVertical: 10,
    borderRadius: 22,
    alignItems: "center",
    marginRight: 8,
  },
  tabButtonActive: {
    backgroundColor: "#7CC84E",
  },
  tabButtonActiveOutline: {
    backgroundColor: "#FFF",
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7CC84E",
  },
  tabButtonTextActive: { color: "#FFF" },
  tabButtonTextOutlineActive: { color: "#7CC84E" },

  emptyText: {
    textAlign: "center",
    color: "#777",
    marginTop: 20,
    fontSize: 14,
  },

  eventCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 16,
    elevation: 3,
    marginBottom: 12,
  },
  dateBox: {
    width: 60,
    backgroundColor: "#7CC84E",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 4,
    marginRight: 12,
  },
  dateDay: { color: "#FFF", fontWeight: "700" },

  eventInfo: { flex: 1 },
  eventName: { fontWeight: "600", fontSize: 16 },
  eventMeta: { fontSize: 12, color: "#666" },
  eventCategory: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "600",
    color: "#7A3EB0",
  },
});