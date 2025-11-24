import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { createEvent } from "../../lib/models/events";
import { Category, getAllCategories } from "../../lib/models/categories";

const USER_ID = "1"; 

export default function CreateEventScreen() {
  const [name, setName] = useState("");
  const [place, setPlace] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );

  const [saving, setSaving] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingCategories(true);
        const data = await getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error cargando categorías:", error);
        Alert.alert("Error", "No fue posible cargar las categorías.");
      } finally {
        setLoadingCategories(false);
      }
    };

    load();
  }, []);

  const handleSave = async () => {
    if (
      !name.trim() ||
      !place.trim() ||
      !startDate.trim() ||
      !startTime.trim() ||
      !selectedCategoryId
    ) {
      Alert.alert(
        "Campos incompletos",
        "Nombre, lugar, fecha inicial, hora inicial y categoría son obligatorios."
      );
      return;
    }

    try {
      setSaving(true);

      await createEvent({
        name: name.trim(),
        place: place.trim(),
        start_date: startDate.trim(),
        end_date: endDate.trim() || startDate.trim(),
        start_time: startTime.trim(),
        end_time: endTime.trim() || startTime.trim(),
        description: description.trim(),
        category_id: selectedCategoryId,
        created_by: USER_ID,
      });

      Alert.alert("Éxito", "Evento creado correctamente.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error creando evento:", error);
      Alert.alert("Error", "No fue posible crear el evento.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* MENÚ LATERAL */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.sideMenu}>
            <Text style={styles.menuTitle}>Menú</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push("/(tabs)/home");
              }}
            >
              <Text style={styles.menuItemText}>Inicio</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push("/(tabs)/categories");
              }}
            >
              <Text style={styles.menuItemText}>Categorías</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push("/(tabs)/events");
              }}
            >
              <Text style={styles.menuItemText}>Eventos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push("/(tabs)/profile");
              }}
            >
              <Text style={styles.menuItemText}>Mi perfil</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
        >
          <View style={styles.menuIconLine} />
          <View style={styles.menuIconLine} />
          <View style={styles.menuIconLine} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear evento</Text>
      </View>

      {/* FORMULARIO */}
      <ScrollView
        style={styles.form}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text style={styles.label}>Nombre del evento</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Taller de velas"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Lugar</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Plaza Gerardo Barrios"
          value={place}
          onChangeText={setPlace}
        />

        <Text style={styles.label}>Fecha de inicio (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="2025-12-06"
          value={startDate}
          onChangeText={setStartDate}
        />

        <Text style={styles.label}>Fecha de fin (opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="2025-12-06"
          value={endDate}
          onChangeText={setEndDate}
        />

        <Text style={styles.label}>Hora de inicio (HH:MM)</Text>
        <TextInput
          style={styles.input}
          placeholder="13:30"
          value={startTime}
          onChangeText={setStartTime}
        />

        <Text style={styles.label}>Hora de fin (opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="15:00"
          value={endTime}
          onChangeText={setEndTime}
        />

        <Text style={styles.label}>Categoría</Text>
        {loadingCategories ? (
          <ActivityIndicator style={{ marginVertical: 8 }} />
        ) : (
          <View style={styles.chipRow}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.chip,
                  selectedCategoryId === cat.id && styles.chipSelected,
                ]}
                onPress={() => setSelectedCategoryId(cat.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedCategoryId === cat.id && styles.chipTextSelected,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Escribe una breve descripción del evento"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "Guardando..." : "Crear evento"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
  },
  menuButton: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuIconLine: {
    width: 24,
    height: 3,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    marginVertical: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  form: {
    paddingHorizontal: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B21A8",
    marginTop: 16,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#F9FAFB",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  chipSelected: {
    backgroundColor: "#22C55E",
    borderColor: "#22C55E",
  },
  chipText: {
    fontSize: 13,
    color: "#4B5563",
  },
  chipTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  saveButton: {
    marginTop: 28,
    marginBottom: 8,
    backgroundColor: "#22C55E",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    flexDirection: "row",
  },
  sideMenu: {
    width: "70%",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#111827",
  },
  menuItem: {
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: "#4B5563",
  },
});