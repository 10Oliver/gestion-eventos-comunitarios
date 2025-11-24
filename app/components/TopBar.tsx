import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TopBar({ title }) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <TouchableOpacity style={styles.menuBtn} >
                <Ionicons name="menu" size={28} color="#22C55E" />
            </TouchableOpacity>

            <Text style={styles.title}>{title}</Text>

            <View style={{ width: 40 }} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },

    menuBtn: {
        padding: 6,
    },

    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
    },
});
