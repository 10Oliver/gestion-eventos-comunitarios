Base de datos (SQLite)

- Motor: expo-sqlite (archivo app.db en el dispositivo)
- Tablas: users, categories, events, event_attendees, meta
- Semillas: categorías base (Deportes, Artes y creatividad, Naturaleza, Festival)

Inicialización
- Se ejecuta automáticamente al montar app/_layout.tsx (initializeDatabase)

Modelos (funciones)
- Categorías: getAllCategories
- Usuarios: upsertUser, getUserById, updateUserProfile
- Eventos: getTop3UpcomingEvents, getAllUpcomingEventsDesc, getEventDetail,
  attendEvent, unattendEvent, createEvent, updateEvent, deleteEvent,
  getEventsCreatedByUser, getEventsUserWillAttend

Notas
- Fechas y horas se guardan como texto ISO (YYYY-MM-DD, HH:mm) y se comparan con datetime('now').
- El usuario activo se guarda en meta.current_user_id.
