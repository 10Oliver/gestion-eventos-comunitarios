import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { initializeDatabase } from '../../lib/db';
import {
  EventWithMeta,
  getAllUpcomingEventsDesc,
} from '../../lib/models/events';

type EventItem = EventWithMeta & { id?: number };

function formatDateLabel(isoDate: string) {
  try {
    const [y, m, d] = isoDate.split('-');
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    const dayStr = d.padStart(2, '0');
    const monthStr = date
      .toLocaleString('es-ES', { month: 'short' })
      .toUpperCase();
    return { day: dayStr, month: monthStr };
  } catch {
    return { day: '??', month: '??' };
  }
}

export default function EventsScreen() {
  const { categoryId, categoryName } = useLocalSearchParams<{
    categoryId?: string;
    categoryName?: string;
  }>();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        await initializeDatabase();

        const all = (await getAllUpcomingEventsDesc()) as EventItem[];

        let filtered = all;
        if (categoryId) {
          filtered = all.filter(
            (e) => String((e as any).category_id) === String(categoryId)
          );
        }

        setEvents(filtered);
      } catch (err) {
        console.error('Error cargando eventos:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [categoryId]);

  const handlePressEvent = (event: EventItem) => {
    if (!event.id) return;
    router.push({
      pathname: '/events/[id]',
      params: { id: String(event.id) },
    });
  };

  const renderItem = ({ item }: { item: EventItem }) => {
    const { day, month } = formatDateLabel(item.start_date);
    const timeRange = `${item.start_time} - ${item.end_time}`;

    return (
      <View style={styles.card}>
        {/* Fecha */}
        <View style={styles.dateBox}>
          <Text style={styles.dateDay}>{day}</Text>
          <Text style={styles.dateMonth}>{month}</Text>
        </View>

        {/* Info del evento */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardLine}>{timeRange}</Text>
          <Text style={styles.cardLine}>{item.place}</Text>
          <Text style={styles.cardLine}>
            {item.category_name} · {item.attendees_count} vecinos asistirán
          </Text>
        </View>

        {/* Botón + funcional */}
        <TouchableOpacity
          style={styles.plusCircle}
          onPress={() =>
  router.push({
    pathname: "/events/[id]",
    params: {
      id: String(item.id),
      title: item.name,            
      place: item.place ?? "",
      start_date: item.start_date,
      end_date: item.end_date,
      start_time: item.start_time,
      end_time: item.end_time,
      description: item.description ?? "",
      category_name: item.category_name ?? "",
    },
  })
}
        >
          <Text style={styles.plusText}>+</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const emptyText = categoryId
    ? 'No hay eventos próximos para esta categoría.'
    : 'No hay eventos próximos.';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PRÓXIMOS EVENTOS</Text>
      <Text style={styles.subtitle}>
        Explora las diferentes actividades y eventos planificados.
      </Text>
      {categoryName ? (
        <Text style={styles.categoryLabel}>
          Categoría: <Text style={styles.categoryName}>{categoryName}</Text>
        </Text>
      ) : null}

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#7B3AED"
          style={{ marginTop: 32 }}
        />
      ) : events.length === 0 ? (
        <Text style={styles.emptyText}>{emptyText}</Text>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item, index) =>
            item.id ? String(item.id) : String(index)
          }
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#7B3AED',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 16,
  },
  categoryName: {
    fontWeight: '600',
    color: '#4CAF50',
  },
  emptyText: {
    marginTop: 40,
    textAlign: 'center',
    color: '#777777',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  dateBox: {
    width: 64,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#6BCB3C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dateDay: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dateMonth: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#222222',
  },
  cardLine: {
    fontSize: 13,
    color: '#666666',
  },
  plusCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FF7A45',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  plusText: {
    fontSize: 22,
    color: '#FF7A45',
    fontWeight: '700',
    marginTop: -2,
  },
});