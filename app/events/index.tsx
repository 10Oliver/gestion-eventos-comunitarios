import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { EventWithMeta, getAllUpcomingEventsDesc } from "../../lib/models/events";


function formatDateLabel(isoDate: string) {
  
  try {
    const [y, m, d] = isoDate.split("-");
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    const dayStr = d.padStart(2, "0");
    const monthStr = date
      .toLocaleString("es-ES", { month: "short" })
      .toUpperCase();
    return { day: dayStr, month: monthStr };
  } catch {
    return { day: "??", month: "??" };
  }
}

export default function EventsScreen() {
  const [events, setEvents] = useState<EventWithMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const rows = await getAllUpcomingEventsDesc();
        setEvents(rows);
      } catch (err) {
        console.error("Error cargando eventos:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>Cargando eventos...</Text>
      </View>
    );
  }

  if (!events.length) {
    return (
      <View style={styles.center}>
        <Text>No hay eventos próximos.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Encabezado tipo Figma */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PRÓXIMOS EVENTOS</Text>
        <Text style={styles.headerSubtitle}>
          Explora las diferentes actividades y eventos planificados.
        </Text>
      </View>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id!.toString()}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => {
          const { day, month } = formatDateLabel(item.start_date);
          return (
            <TouchableOpacity style={styles.card}>
              {/* Bloque verde con fecha */}
              <View style={styles.dateBox}>
                <Text style={styles.dateDay}>{day}</Text>
                <Text style={styles.dateMonth}>{month}</Text>
              </View>

              {/* Info del evento */}
              <View style={styles.info}>
                <Text style={styles.eventName}>{item.name}</Text>

                <Text style={styles.eventMeta}>
                  {item.start_time} - {item.end_time}
                </Text>

                {item.place && (
                  <Text style={styles.eventMeta}>{item.place}</Text>
                )}

                <Text style={styles.eventMeta}>
                  {item.category_name} · {item.attendees_count} vecinos asistirán
                </Text>
              </View>

              {/* Botón +  */}
              <View style={styles.actionBox}>
                <Text style={styles.plus}>＋</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#7E3FA5", 
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E2E2",
  },
  dateBox: {
    width: 54,
    height: 64,
    backgroundColor: "#76C64B",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  dateDay: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  dateMonth: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  info: {
    flex: 1,
  },
  eventName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  eventMeta: {
    fontSize: 12,
    color: "#666",
  },
  actionBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F36C3D",
    alignItems: "center",
    justifyContent: "center",
  },
  plus: {
    fontSize: 20,
    color: "#F36C3D",
    fontWeight: "700",
    lineHeight: 20,
  },
});