import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getAllCategories } from '../../lib/models/categories';
import { getTop3UpcomingEvents, getAllUpcomingEventsDesc, getEventDetail, attendEvent, unattendEvent, createEvent, updateEvent, deleteEvent, getEventsCreatedByUser, getEventsUserWillAttend } from '../../lib/models/events';
import { getCurrentUserId } from '../../lib/db';
import { getUserById, updateUserProfile } from '../../lib/models/users';

export default function Home() {
  const { email, name, picture } = useLocalSearchParams();
  const [out, setOut] = React.useState<any>({});
  const [currentUser, setCurrentUser] = React.useState<string | undefined>();
  const [selectedEventId, setSelectedEventId] = React.useState<number | undefined>();

  React.useEffect(() => {
    (async () => {
      const uid = (await getCurrentUserId()) || 'seed-user-1';
      setCurrentUser(uid);
      await runDemo(uid);
    })().catch(console.error);
  }, []);

  const runDemo = async (uid: string) => {
    const categories = await getAllCategories();
    const top3 = await getTop3UpcomingEvents();
    const upcoming = await getAllUpcomingEventsDesc();
    const firstId = top3[0]?.id || upcoming[0]?.id;
    setSelectedEventId(firstId);
    const detail = firstId ? await getEventDetail(firstId) : undefined;

    // Profile create/edit demo
    const beforeProfile = uid ? await getUserById(uid) : undefined;
    if (uid) {
      await updateUserProfile(uid, { description: `Perfil de prueba ${new Date().toISOString()}`, address: 'Calle Falsa 123' });
    }
    const afterProfile = uid ? await getUserById(uid) : undefined;

    // Create -> Update -> Delete event demo
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const d = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const createdId = await createEvent({
      name: 'Evento DEMO',
      place: 'Sala Demo',
      start_date: date,
      end_date: date,
      start_time: '14:00',
      end_time: '16:00',
      category_id: categories[0]?.id ?? 1,
      description: 'Creado desde demo',
      created_by: uid,
    });
    if (createdId) await updateEvent(createdId, { name: 'Evento DEMO (editado)' });
    const createdByUser = await getEventsCreatedByUser(uid);
    const attendingBefore = await getEventsUserWillAttend(uid);
    if (firstId) await attendEvent(firstId, uid);
    const attendingAfterAttend = await getEventsUserWillAttend(uid);
    if (firstId) await unattendEvent(firstId, uid);
    const attendingAfterUnattend = await getEventsUserWillAttend(uid);
    if (createdId) await deleteEvent(createdId);

    setOut({
      categories,
      top3,
      upcoming,
      eventDetail: detail,
      profileBefore: beforeProfile,
      profileAfter: afterProfile,
      createdByUser,
      attendingBefore,
      attendingAfterAttend,
      attendingAfterUnattend,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome!</Text>
      {picture && typeof picture === 'string' && (
        <Image source={{ uri: picture }} style={styles.avatar} />
      )}
      {name && <Text style={styles.name}>{String(name)}</Text>}
      {email && <Text style={styles.email}>{String(email)}</Text>}
      <Text style={styles.section}>Usuario actual: {currentUser || 'N/D'}</Text>

      <TouchableOpacity style={styles.button} onPress={() => currentUser && runDemo(currentUser)}>
        <Text style={styles.buttonText}>Re-ejecutar demo</Text>
      </TouchableOpacity>

      {selectedEventId ? (
        <Text style={styles.section}>Evento seleccionado: {selectedEventId}</Text>
      ) : null}

      <Text style={styles.section}>Categorías</Text>
      <Text style={styles.code}>{JSON.stringify(out.categories, null, 2)}</Text>

      <Text style={styles.section}>Top 3 próximos</Text>
      <Text style={styles.code}>{JSON.stringify(out.top3, null, 2)}</Text>

      <Text style={styles.section}>Próximos (desc)</Text>
      <Text style={styles.code}>{JSON.stringify(out.upcoming, null, 2)}</Text>

      <Text style={styles.section}>Detalle evento</Text>
      <Text style={styles.code}>{JSON.stringify(out.eventDetail, null, 2)}</Text>

      <Text style={styles.section}>Perfil antes</Text>
      <Text style={styles.code}>{JSON.stringify(out.profileBefore, null, 2)}</Text>

      <Text style={styles.section}>Perfil después</Text>
      <Text style={styles.code}>{JSON.stringify(out.profileAfter, null, 2)}</Text>

      <Text style={styles.section}>Eventos creados por usuario</Text>
      <Text style={styles.code}>{JSON.stringify(out.createdByUser, null, 2)}</Text>

      <Text style={styles.section}>Asistencias (antes)</Text>
      <Text style={styles.code}>{JSON.stringify(out.attendingBefore, null, 2)}</Text>

      <Text style={styles.section}>Asistencias (después de asistir)</Text>
      <Text style={styles.code}>{JSON.stringify(out.attendingAfterAttend, null, 2)}</Text>

      <Text style={styles.section}>Asistencias (después de quitar)</Text>
      <Text style={styles.code}>{JSON.stringify(out.attendingAfterUnattend, null, 2)}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 8,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  name: { fontSize: 18, fontWeight: '600' },
  email: { fontSize: 14, color: '#666' },
  section: { marginTop: 16, fontSize: 16, fontWeight: '600' },
  code: { fontFamily: 'monospace', fontSize: 12, backgroundColor: '#f5f5f5', padding: 8, borderRadius: 6 },
  button: { backgroundColor: '#0a7', padding: 10, borderRadius: 6, alignSelf: 'flex-start', marginTop: 8 },
  buttonText: { color: 'white', fontWeight: '600' },
});
