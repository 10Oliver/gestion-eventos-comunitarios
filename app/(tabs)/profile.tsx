import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";

import { initializeDatabase } from "../../lib/db";
import {
  EventWithMeta,
  getEventsCreatedByUser,
  getEventsUserWillAttend,
} from "../../lib/models/events";
import { getUsersByIds, updateUserProfile } from "../../lib/models/users";

const USER_ID = "1"; 

type EventItem = EventWithMeta;
type TabType = "created" | "attending";

export default function ProfileScreen() {
  const { email, name } = useLocalSearchParams<{
    email?: string;
    name?: string;
  }>();

  const [aboutMe, setAboutMe] = useState("");
  const [address, setAddress] = useState("");
  const [createdEvents, setCreatedEvents] = useState<EventItem[]>([]);
  const [attendingEvents, setAttendingEvents] = useState<EventItem[]>([]);
  const [selectedTab, setSelectedTab] = useState<TabType>("created");
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await initializeDatabase();

        // Cargar datos del usuario desde SQLite
        const users = await getUsersByIds([USER_ID]);
        const user = users[0];

        setAboutMe(user?.description ?? "Ejemplo de información");
        setAddress(user?.address ?? "Comunidad Prusia");

        // Cargar eventos creados y a los que asistirá
        const created = await getEventsCreatedByUser(USER_ID);
        const attending = await getEventsUserWillAttend(USER_ID);

        setCreatedEvents(created as EventItem[]);
        setAttendingEvents(attending as EventItem[]);
      } catch (err) {
        console.log("Error cargando datos de perfil:", err);
        Alert.alert(
          "Error",
          "Hubo un problema cargando tu información desde SQLite."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const eventsToShow =
    selectedTab === "created" ? createdEvents : attendingEvents;

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      await updateUserProfile(USER_ID, {
        description: aboutMe,
        address: address,
      });
      Alert.alert("Éxito", "Tu perfil se ha actualizado.");
      setIsEditing(false);
    } catch (err) {
      console.log("Error guardando perfil:", err);
      Alert.alert("Error", "No fue posible actualizar tu perfil.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleMenuNavigate = (path: string) => {
    setMenuVisible(false);
    router.push(path as any);
  };

  const renderEvent = ({ item }: { item: EventItem }) => (
    <View style={styles.eventCard}>
      <Text style={styles.eventTitle}>{item.name}</Text>
      <Text style={styles.eventLine}>
        {item.start_date} – {item.start_time} a {item.end_time}
      </Text>
      <Text style={styles.eventLine}>{item.place}</Text>
      <Text style={styles.eventLine}>
        {item.category_name ?? "Sin categoría"} ·{" "}
        {item.attendees_count ?? 0} vecinos asistirán
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
        >
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
      </View>

      <ScrollView>
        {/* USUARIO */}
        <Text style={styles.sectionLabel}>USUARIO</Text>

        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(name ?? "P").charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.userInfo}>
            {/* Correo (solo lectura) */}
            <Text style={styles.userEmail}>
              {email ?? "porejemplo@abc.com"}
            </Text>

            {/* Dirección editable */}
            {isEditing ? (
              <TextInput
                style={styles.userInput}
                value={address}
                onChangeText={setAddress}
                placeholder="Comunidad / Dirección"
              />
            ) : (
              <Text style={styles.userSub}>{address}</Text>
            )}

            <Text style={styles.hintText}>
              El correo se obtiene del inicio de sesión y es solo de lectura.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              if (isEditing) {
                handleSaveProfile();
              } else {
                setIsEditing(true);
              }
            }}
            disabled={savingProfile}
          >
            <Text style={styles.editButtonText}>
              {isEditing ? (savingProfile ? "Guardando..." : "Guardar") : "Editar"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* SOBRE MÍ */}
        <Text style={styles.sectionLabel}>SOBRE MÍ</Text>

        <View style={styles.aboutCard}>
          {isEditing ? (
            <TextInput
              style={styles.aboutInput}
              multiline
              value={aboutMe}
              onChangeText={setAboutMe}
              placeholder="Escribe algo sobre ti..."
            />
          ) : (
            <Text style={styles.aboutText}>{aboutMe}</Text>
          )}
        </View>

        {/* MIS EVENTOS */}
        <Text style={styles.sectionLabel}>MIS EVENTOS</Text>

        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === "created" && styles.tabActive,
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
              styles.tab,
              selectedTab === "attending" && styles.tabActive,
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

        {loading ? (
  <ActivityIndicator style={{ marginTop: 24 }} color="#22C55E" />
) : eventsToShow.length === 0 ? (
  <Text style={styles.emptyText}>No hay eventos.</Text>
) : (
  <View
    style={{
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 16,
    }}
  >
    {eventsToShow.map((item) => (
      <View key={item.id} style={styles.eventCard}>
        <Text style={styles.eventTitle}>{item.name}</Text>
        <Text style={styles.eventLine}>
          {item.start_date} – {item.start_time} a {item.end_time}
        </Text>
        <Text style={styles.eventLine}>{item.place}</Text>
        <Text style={styles.eventLine}>
          {item.category_name ?? "Sin categoría"} ·{" "}
          {item.attendees_count ?? 0} vecinos asistirán
        </Text>
      </View>
    ))}
  </View>
)}

      </ScrollView>

      {/* MENÚ LATERAL */}
      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPressOut={() => setMenuVisible(false)}
        >
          <View style={styles.sideMenu}>
            <View style={styles.sideMenuHeader}>
              <View style={styles.avatarSmall}>
                <Text style={styles.avatarSmallText}>
                  {(name ?? "P").charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.sideMenuName}>
                  {name ?? "Usuario"}
                </Text>
                <Text style={styles.sideMenuEmail}>
                  {email ?? "porejemplo@abc.com"}
                </Text>
              </View>
            </View>

            <View style={styles.sideMenuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuNavigate("/home")}
            >
              <Text style={styles.menuItemIcon}>🏠</Text>
              <Text style={styles.menuItemText}>Inicio</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuNavigate("/categories")}
            >
              <Text style={styles.menuItemIcon}>🗂️</Text>
              <Text style={styles.menuItemText}>Categorías</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuNavigate("/events")}
            >
              <Text style={styles.menuItemIcon}>📅</Text>
              <Text style={styles.menuItemText}>Eventos</Text>
            </TouchableOpacity>

            <View style={styles.sideMenuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                Alert.alert(
                  "Cerrar sesión",
                );
              }}
            >
              <Text style={styles.menuItemIcon}>🚪</Text>
              <Text style={[styles.menuItemText, { color: "#EF4444" }]}>
                Cerrar sesión
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginLeft: 16,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
  },
  menuLine: {
    width: 18,
    height: 2,
    backgroundColor: "#FFFFFF",
    marginVertical: 2,
    borderRadius: 999,
  },
  sectionLabel: {
    marginTop: 16,
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: "700",
    color: "#7C3AED",
  },
  userCard: {
    margin: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 24,
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: "600",
  },
  userSub: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 2,
  },
  userInput: {
    fontSize: 14,
    color: "#111827",
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
    paddingVertical: 2,
    marginTop: 4,
  },
  hintText: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 4,
  },
  editButton: {
    marginLeft: 8,
    backgroundColor: "#F97316",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  aboutCard: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
  },
  aboutInput: {
    minHeight: 80,
    textAlignVertical: "top",
    fontSize: 14,
    color: "#111827",
  },
  aboutText: {
    fontSize: 14,
    color: "#111827",
  },
  tabsRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
  },
  tab: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#22C55E",
    paddingVertical: 10,
    alignItems: "center",
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: "#22C55E",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#22C55E",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 24,
    color: "#6B7280",
  },
  eventCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  eventLine: {
    fontSize: 14,
    color: "#4B5563",
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    flexDirection: "row",
  },
  sideMenu: {
    width: "75%",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 24,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
  },
  sideMenuHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarSmallText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 18,
  },
  sideMenuName: {
    fontSize: 16,
    fontWeight: "700",
  },
  sideMenuEmail: {
    fontSize: 12,
    color: "#6B7280",
  },
  sideMenuDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  menuItemIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  menuItemText: {
    fontSize: 15,
    color: "#111827",
  },
});