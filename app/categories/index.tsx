import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
} from 'react-native';
import { router } from 'expo-router';

import { initializeDatabase } from '../../lib/db';
import { getAllCategories, Category } from '../../lib/models/categories';

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        await initializeDatabase();
        const data = await getAllCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error cargando categorías:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handlePressCategory = (category: Category) => {
    
    router.push({
      pathname: '/events',
      params: {
        categoryId: String(category.id),
        categoryName: category.name,
      },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Categorías</Text>
      <Text style={styles.subtitle}>
        Explora las diferentes actividades y eventos planificados.
      </Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#4CAF50"
          style={{ marginTop: 32 }}
        />
      ) : (
        categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.card}
            onPress={() => handlePressCategory(cat)}
          >
            <View>
              <Text style={styles.cardTitle}>{mapCategoryTitle(cat.name)}</Text>
              <Text style={styles.cardText}>
                {mapCategoryDescription(cat.name)}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}


function mapCategoryTitle(dbName: string) {
  switch (dbName) {
    case 'Deportes':
      return 'Deportes';
    case 'Artes y creatividad':
      return 'Cultura';
    case 'Naturaleza':
      return 'Talleres'; 
    case 'Festival':
      return 'Festival';
    default:
      return dbName;
  }
}

function mapCategoryDescription(dbName: string) {
  switch (dbName) {
    case 'Deportes':
      return 'Eventos y actividades deportivas';
    case 'Artes y creatividad':
      return 'Arte, música, exposiciones';
    case 'Naturaleza':
      return 'Capacitaciones y charlas';
    case 'Festival':
      return 'Fiestas, ferias y celebraciones';
    default:
      return 'Eventos relacionados con esta categoría.';
  }
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#7B3AED',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#222222',
  },
  cardText: {
    fontSize: 14,
    color: '#666666',
  },
});