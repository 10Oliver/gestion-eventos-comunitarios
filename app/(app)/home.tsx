import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { router } from "expo-router";

type DisplayUser = {
  name?: string;
  email?: string;
  photo_url?: string;
};

export default function Home() {
  const params = useLocalSearchParams();
  const [user, setUser] = React.useState<DisplayUser>({
    name: typeof params.name === 'string' ? params.name : undefined,
    email: typeof params.email === 'string' ? params.email : undefined,
    photo_url: typeof params.picture === 'string' ? params.picture : undefined,
  });

  const [loading, setLoading] = React.useState(!user.email);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      (async () => {
        try {
          const { getCurrentUserId } = await import('../../lib/db');
          const { getUserById } = await import('../../lib/models/users');

          const currentUserId = await getCurrentUserId();
          if (!currentUserId) return;

          const dbUser = await getUserById(currentUserId);
          if (dbUser && isActive) {
            setUser((prev) => ({
              name: dbUser.name ?? prev.name,
              email: dbUser.email ?? prev.email,
              photo_url: dbUser.photo_url ?? prev.photo_url,
            }));
          }
        } catch (error) {
          console.error('Error loading user profile', error);
        } finally {
          if (isActive) setLoading(false);
        }
      })();

      return () => {
        isActive = false;
      };
    }, [])
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>


      {/* HEADER */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>
            ¡Bienvenidos{user.name ? `, ${user.name}` : ''}!
          </Text>

          <Text style={styles.headerSubtitle}>
            Hay 2 eventos cerca de ti. ¡Descubre qué está pasando!
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator color="white" />
        ) : user.photo_url ? (
          <Image
            source={{ uri: user.photo_url }}
            style={styles.avatar}
          />
        ) : (
          <Ionicons name="person-circle-outline" size={48} color="white" />
        )}
      </View>

      {/* CATEGORÍAS */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { textAlign: 'center' }]}>CATEGORÍAS</Text>
        <Text style={[styles.sectionSubtitle, { textAlign: 'center' }]}>
          Explora actividades deportivas, artísticas, ecológicas y de voluntariado
        </Text>

        <View style={styles.categoriesRow}>
          <Category icon="football-outline" />
          <Category icon="heart-outline" />
          <Category icon="color-palette-outline" />
          <Category icon="leaf-outline" />
        </View>
      </View>

      {/* PRÓXIMOS EVENTOS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PRÓXIMOS EVENTOS</Text>

        <EventCard
          date="15"
          month="NOV"
          title="Clase de Yoga"
          hours="10:00 AM - 11:00 AM"
          location="Parque Central"
        />

        <EventCard
          date="20"
          month="NOV"
          title="Jornada de Limpieza"
          hours="8:00 AM - 10:00 AM"
          location="Av. Principal"
        />

        <TouchableOpacity style={styles.viewMoreBtn}>
          <Text style={styles.viewMoreText}>Ver todos los eventos</Text>
          <Ionicons name="arrow-forward-outline" size={18} color="#6A40E4" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* ----------- COMPONENTES ---------- */

function Category({ icon }: { icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.categoryIcon}>
      <Ionicons name={icon} size={28} color="white" />
    </View>
  );
}

function EventCard({ date, month, title, hours, location }) {
  return (
    <View style={styles.eventCard}>
      <View style={styles.dateBox}>
        <Text style={styles.dateDay}>{date}</Text>
        <Text style={styles.dateMonth}>{month}</Text>
      </View>

      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={styles.eventTitle}>{title}</Text>

        <View style={styles.row}>
          <Ionicons name="time-outline" size={16} color="#8a8a8a" />
          <Text style={styles.eventInfo}>{hours}</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="location-outline" size={16} color="#8a8a8a" />
          <Text style={styles.eventInfo}>{location}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.plusBtn}
        onPress={() => router.push("/event-details")}
      >
        <Ionicons name="add-outline" size={24} color="white" />
      </TouchableOpacity>

    </View>
  );
}

/* ----------- ESTILOS ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },

  /* TOP BAR */
  topBar: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuBtn: {
    padding: 4,
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },

  /* HEADER */
  header: {
    backgroundColor: "#7CC56F",
    padding: 22,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "white",
    fontSize: 13,
    marginRight: 12,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 25,
    marginLeft: 12,
    borderWidth: 2,
    borderColor: "white",
  },

  /* SECCIONES */
  section: {
    paddingHorizontal: 20,
    marginBottom: 22,
  },
  sectionTitle: {
    fontWeight: "bold",
    color: "#6A40E4",
    fontSize: 18,
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: "#555",
    marginBottom: 18,
    fontSize: 13,
  },

  /* CATEGORÍAS */
  categoriesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  categoryIcon: {
    backgroundColor: "#7CC56F",
    padding: 18,
    borderRadius: 16,
  },

  /* EVENTOS */
  eventCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  dateBox: {
    backgroundColor: "#7CC56F",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  dateDay: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  dateMonth: {
    color: "white",
    fontSize: 13,
  },

  eventTitle: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 6,
  },
  eventInfo: {
    color: "#666",
    marginLeft: 6,
    fontSize: 12,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  plusBtn: {
    backgroundColor: "#FF6F4A",
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  viewMoreBtn: {
    marginTop: 6,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  viewMoreText: {
    color: "#6A40E4",
    fontWeight: "bold",
    marginRight: 6,
  },
});
