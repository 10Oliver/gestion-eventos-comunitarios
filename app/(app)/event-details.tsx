import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function EventDetails() {
    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <ScrollView contentContainerStyle={styles.container}>

                {/* TITULO */}
                <Text style={styles.eventTitle}>CLASE DE YOGA</Text>

                {/* TARJETA PRINCIPAL */}
                <View style={styles.mainCard}>
                    <View style={styles.dateBox}>
                        <Text style={styles.dateDay}>15</Text>
                        <Text style={styles.dateMonth}>NOV</Text>
                    </View>

                    <View style={{ flex: 1, marginLeft: 14 }}>
                        <View style={styles.row}>
                            <Ionicons name="time-outline" size={16} color="#8a8a8a" />
                            <Text style={styles.eventInfo}>10:00 AM - 11:00 AM</Text>
                        </View>

                        <View style={styles.row}>
                            <Ionicons name="location-outline" size={16} color="#8a8a8a" />
                            <Text style={styles.eventInfo}>Parque Central</Text>
                        </View>
                    </View>
                </View>

                {/* ORGANIZADO POR */}
                <Text style={styles.sectionTitle}>ORGANIZADO POR</Text>
                <Text style={styles.organizer}>Luisa Martínez</Text>

                {/* SOBRE EL EVENTO */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>SOBRE EL EVENTO</Text>

                    <View style={styles.categoryTag}>
                        <Ionicons name="football-outline" size={16} color="white" />
                        <Text style={styles.categoryText}>Deportes</Text>
                    </View>
                </View>

                {/* DESCRIPCIÓN */}
                <View style={styles.descriptionCard}>
                    <Text style={styles.descriptionText}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Suspendisse urna ex, efficitur at dignissim ac, aliquet tincidunt massa.
                        Nullam a erat et arcu vestibulum pretium sed sit amet neque.
                    </Text>
                </View>

                {/* BOTÓN DE ASISTENTES */}
                <View style={styles.attendInfo}>
                    <Ionicons name="people-outline" size={20} color="white" style={{ marginRight: 8 }} />
                    <Text style={styles.attendText}>10 Vecinos Asistirán</Text>
                </View>

            </ScrollView>

            {/* BOTÓN FIJO INFERIOR */}
            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.joinBtn}>
                    <Text style={styles.joinText}>Unirme</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 100,
    },

    eventTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#6A40E4",
        textAlign: "center",
        marginBottom: 20,
    },

    /* CARD PRINCIPAL */
    mainCard: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 30,
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
        fontSize: 20,
    },
    dateMonth: {
        color: "white",
        fontSize: 13,
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    eventInfo: {
        color: "#666",
        marginLeft: 6,
        fontSize: 13,
    },

    /* ORGANIZADO POR */
    organizer: {
        fontSize: 15,
        color: "#333",
        marginBottom: 25,
    },

    /* SOBRE EL EVENTO */
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    sectionTitle: {
        fontWeight: "bold",
        color: "#6A40E4",
        fontSize: 15,
    },

    categoryTag: {
        backgroundColor: "#7CC56F",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        flexDirection: "row",
        alignItems: "center",
    },
    categoryText: {
        color: "white",
        marginLeft: 6,
        fontSize: 13,
        fontWeight: "500",
    },

    /* DESCRIPCIÓN */
    descriptionCard: {
        backgroundColor: "white",
        padding: 16,
        borderRadius: 12,
        marginBottom: 30,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    descriptionText: {
        fontSize: 14,
        color: "#444",
        lineHeight: 20,
    },

    /* BOTÓN DE ASISTENTES */
    attendInfo: {
        flexDirection: "row",
        backgroundColor: "#7CC56F",
        padding: 14,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    attendText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 15,
    },

    /* BOTTOM BAR */
    bottomBar: {
        width: "100%",
        paddingVertical: 12,
        backgroundColor: "white",
        borderTopWidth: 1,
        borderColor: "#e6e6e6",
        alignItems: "center",
    },

    joinBtn: {
        backgroundColor: "#FF6F4A",
        paddingVertical: 14,
        paddingHorizontal: 60,
        borderRadius: 12,
        alignItems: "center",
    },

    joinText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },

});
