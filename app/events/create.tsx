import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { createEvent } from "../../lib/models/events";
import { getAllCategories } from "../../lib/models/categories";


type Category = {
  id: number;
  name: string;
  description?: string;
};

export default function CreateEventScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [place, setPlace] = useState("");
  const [date, setDate] = useState("");        // formato: YYYY-MM-DD
  const [time, setTime] = useState("");        // formato: HH:mm
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const rows = await getAllCategories();
        setCategories(rows as any);
      } catch (error) {
        console.error("Error cargando categorías", error);
      }
    };

    loadCategories();
  }, []);

  const handleCreate = async () => {
    if (
      !name.trim() ||
      !place.trim() ||
      !date.trim() ||
      !time.trim() ||
      !description.trim() ||
      !selectedCategoryId
    ) {
      Alert.alert(
        "Campos incompletos",
        "Por favor completa todos los campos y selecciona una categoría."
      );
      return;
    }

    setLoading(true);

    try {
      await createEvent({
        name: name.trim(),
        place: place.trim(),
        start_date: date.trim(),
        end_date: date.trim(), 
        start_time: time.trim(),
        end_time: time.trim(), 
        category_id: selectedCategoryId,
        description: description.trim(),
        
        created_by: "1",
      } as any);

      Alert.alert("Éxito", "El evento se creó correctamente.", [
        {
          text: "OK",
          onPress: () => {
           
            router.replace("/events");
          },
        },
      ]);
    } catch (error) {
      console.error("Error creando evento", error);
      Alert.alert(
        "Error",
        "Ocurrió un problema al crear el evento. Inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
   
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Encabezado */}
        <Text style={styles.title}>Nuevo Evento</Text>
        <Text style={styles.subtitle}>
          Agrega los datos principales del evento para compartirlo con la
          comunidad.
        </Text>

        {/* Nombre */}
        <TextInput
          style={styles.input}
          placeholder="Nombre del evento"
          placeholderTextColor="#c9e6b8"
          value={name}
          onChangeText={setName}
        />

        {/* Lugar */}
        <TextInput
          style={styles.input}
          placeholder="Lugar"
          placeholderTextColor="#c9e6b8"
          value={place}
          onChangeText={setPlace}
        />

        {/* Fecha */}
        <TextInput
          style={styles.input}
          placeholder="Fecha (YYYY-MM-DD)"
          placeholderTextColor="#c9e6b8"
          value={date}
          onChangeText={setDate}
        />

        {/* Hora */}
        <TextInput
          style={styles.input}
          placeholder="Hora (HH:mm)"
          placeholderTextColor="#c9e6b8"
          value={time}
          onChangeText={setTime}
        />

        {/* Categoría */}
        <Text style={styles.label}>Categoría</Text>
        <View style={styles.categoryRow}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                selectedCategoryId === cat.id && styles.categoryChipSelected,
              ]}
              onPress={() => setSelectedCategoryId(cat.id)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategoryId === cat.id &&
                    styles.categoryChipTextSelected,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Descripción */}
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Sobre el evento"
          placeholderTextColor="#c9e6b8"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        {/* Botón Crear evento */}
        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleCreate}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Creando..." : "Crear evento"}
          </Text>
        </TouchableOpacity>

        {/* Botón Regresar */}
        <TouchableOpacity onPress={handleGoBack}>
          <Text style={styles.backText}>Regresar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#51B548", 
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#f3ffe8",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#e0f3cf",
  },
  textArea: {
    height: 110,
    textAlignVertical: "top",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 4,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#51B548",
    backgroundColor: "#fff",
  },
  categoryChipSelected: {
    backgroundColor: "#51B548",
  },
  categoryChipText: {
    fontSize: 13,
    color: "#51B548",
    fontWeight: "500",
  },
  categoryChipTextSelected: {
    color: "#fff",
  },
  button: {
    backgroundColor: "#51B548",
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  backText: {
    textAlign: "center",
    color: "#555",
    textDecorationLine: "underline",
    marginTop: 8,
    fontSize: 14,
  },
});