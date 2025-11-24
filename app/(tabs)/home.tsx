import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";

import { initializeDatabase } from "../../lib/db";
import { getAllUpcomingEventsDesc, EventWithMeta } from "../../lib/models/events";
import TopBar from "../components/TopBar";

type EventItem = EventWithMeta & { id?: number };

export default function Home() {
  const { name } = useLocalSearchParams<{ name?: string }>();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar eventos REALES desde SQLite
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        await initializeDatabase();

        const allEvents = await getAllUpcomingEventsDesc();
        const onlyTwo = allEvents.slice(0, 2); // mostrar solo 2 como en el diseño
        setEvents(onlyTwo);
      } catch (err) {
        console.error("Error cargando eventos:", err);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <TopBar title="Inicio" />

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* HEADER VERDE */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>
              ¡Bienvenido{name ? `, ${name}` : ""}!
            </Text>

            <Text style={styles.headerSubtitle}>
              Hay {events.length} eventos cerca de ti. ¡Descubre qué está pasando!
            </Text>
          </View>

          <Ionicons name="person-circle-outline" size={48} color="white" />
        </View>

        {/* CATEGORÍAS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: "center" }]}>CATEGORÍAS</Text>
          <Text style={[styles.sectionSubtitle, { textAlign: "center" }]}>
            Explora actividades deportivas, artísticas, ecológicas y de voluntariado
          </Text>

          <View style={styles.categoriesRow}>

            {/* ⚽ Deportes */}
            <Category
              icon="football-outline"
              label="Deportes"
              onPress={() => router.push({
                pathname: "/events",
                params: { categoryId: "1", categoryName: "Deportes" }
              })}
            />

            {/* ❤️ Festival */}
            <Category
              icon="heart-outline"
              label="Festival"
              onPress={() => router.push({
                pathname: "/events",
                params: { categoryId: "4", categoryName: "Festival" }
              })}
            />

            {/* 🎨 Artes y creatividad */}
            <Category
              icon="color-palette-outline"
              label="Artes y creatividad"
              onPress={() => router.push({
                pathname: "/events",
                params: { categoryId: "2", categoryName: "Artes y creatividad" }
              })}
            />

            {/* 🌿 Naturaleza */}
            <Category
              icon="leaf-outline"
              label="Naturaleza"
              onPress={() => router.push({
                pathname: "/events",
                params: { categoryId: "3", categoryName: "Naturaleza" }
              })}
            />

          </View>
        </View>

        {/* PRÓXIMOS EVENTOS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRÓXIMOS EVENTOS</Text>

          {loading ? (
            <ActivityIndicator color="#7CC56F" style={{ marginVertical: 20 }} />
          ) : events.length === 0 ? (
            <Text style={styles.emptyText}>No hay eventos disponibles</Text>
          ) : (
            events.map((ev) => <EventCard key={ev.id} event={ev} />)
          )}

          <TouchableOpacity style={styles.viewMoreBtn} onPress={() => router.push("/events")}>
            <Text style={styles.viewMoreText}>Ver todos los eventos</Text>
            <Ionicons name="arrow-forward-outline" size={18} color="#6A40E4" />
          </TouchableOpacity>
        </View>

        {/* BOTÓN FLOTANTE PARA CREAR EVENTO */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/events/create")}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

/* ----------- COMPONENTES ---------- */

function Category({ icon, label, onPress }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.categoryIcon}>
        <Ionicons name={icon} size={28} color="white" />
      </View>
      <Text style={styles.categoryLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function EventCard({ event }: { event: EventItem }) {
  const { id, name, start_date, start_time, end_time, place, category_name, attendees_count } = event;

  const [y, m, d] = start_date.split("-");
  const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
  const day = d.padStart(2, "0");
  const month = dateObj.toLocaleString("es-ES", { month: "short" }).toUpperCase();

  return (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() =>
        router.push({
          pathname: "/events/[id]",
          params: {
            id: String(id),
            title: name,
            place: place ?? "",
            start_date,
            start_time,
            end_time,
            description: event.description ?? "",
            category_name: category_name ?? "",
            attendees_count: attendees_count ?? 0
          },
        })
      }
    >
      <View style={styles.dateBox}>
        <Text style={styles.dateDay}>{day}</Text>
        <Text style={styles.dateMonth}>{month}</Text>
      </View>

      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={styles.eventTitle}>{name}</Text>

        <View style={styles.row}>
          <Ionicons name="time-outline" size={16} color="#8a8a8a" />
          <Text style={styles.eventInfo}>{start_time} - {end_time}</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="location-outline" size={16} color="#8a8a8a" />
          <Text style={styles.eventInfo}>{place}</Text>
        </View>

        <Text style={[styles.eventInfo, { marginTop: 4 }]}>
          {category_name} · {attendees_count ?? 0} vecinos asistirán
        </Text>
      </View>

      <View style={styles.plusBtn}>
        <Ionicons name="add-outline" size={22} color="white" />
      </View>
    </TouchableOpacity>
  );
}

/* ----------- ESTILOS ---------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },

  header: {
    backgroundColor: "#7CC56F",
    padding: 22,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  headerTitle: { color: "white", fontSize: 20, fontWeight: "bold", marginBottom: 4 },
  headerSubtitle: { color: "white", fontSize: 13 },

  section: { paddingHorizontal: 20, marginBottom: 28 },
  sectionTitle: { fontWeight: "bold", color: "#6A40E4", fontSize: 18, marginBottom: 4 },
  sectionSubtitle: { color: "#555", marginBottom: 22, fontSize: 13 },

  categoriesRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  categoryIcon: { backgroundColor: "#7CC56F", padding: 18, borderRadius: 16, alignItems: "center" },
  categoryLabel: { textAlign: "center", marginTop: 6, color: "#444", fontSize: 12 },

  eventCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
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
  dateDay: { color: "white", fontWeight: "bold", fontSize: 18 },
  dateMonth: { color: "white", fontSize: 13 },

  eventTitle: { fontWeight: "bold", fontSize: 15, marginBottom: 6 },
  eventInfo: { color: "#666", marginLeft: 6, fontSize: 12 },

  row: { flexDirection: "row", alignItems: "center", marginBottom: 4 },

  plusBtn: {
    backgroundColor: "#FF6F4A",
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  viewMoreBtn: {
    marginTop: 14,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  viewMoreText: { color: "#6A40E4", fontWeight: "bold", marginRight: 6 },

  emptyText: { textAlign: "center", color: "#666", fontStyle: "italic", marginTop: 10 },
  fab: {
    position: "absolute",
    bottom: 40,
    right: 20,
    backgroundColor: "#6A40E4",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

});
