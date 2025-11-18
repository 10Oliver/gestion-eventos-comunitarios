import React, { useEffect, useRef } from "react";
import {
    Animated,
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
    Dimensions,
} from "react-native";
import { Link } from "expo-router";

const SCREEN_WIDTH = Dimensions.get("window").width;

type SideMenuProps = {
    open: boolean;
    close: () => void;
};

export default function SideMenu({ open, close }: SideMenuProps) {
    const slide = useRef(new Animated.Value(-SCREEN_WIDTH)).current;

    useEffect(() => {
        Animated.timing(slide, {
            toValue: open ? 0 : -SCREEN_WIDTH,
            duration: 250,
            useNativeDriver: true,
        }).start();
    }, [open]);

    return (
        <>
            {open && (
                <TouchableOpacity style={styles.backdrop} onPress={close} />
            )}

            <Animated.View
                style={[
                    styles.menu,
                    { transform: [{ translateX: slide }] },
                ]}
            >
                <Text style={styles.title}>Menú</Text>

                <Link href="/(app)/home" asChild>
                    <TouchableOpacity style={styles.item} onPress={close}>
                        <Text style={styles.text}>Inicio</Text>
                    </TouchableOpacity>
                </Link>

                <Link href="/(app)/profile" asChild>
                    <TouchableOpacity style={styles.item} onPress={close}>
                        <Text style={styles.text}>Perfil</Text>
                    </TouchableOpacity>
                </Link>
            </Animated.View>
        </>
    );
}


const styles = StyleSheet.create({
    backdrop: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0,0,0,0.3)",
        zIndex: 9998,
    },
    menu: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        width: SCREEN_WIDTH * 0.7,
        backgroundColor: "white",
        paddingTop: 60,
        paddingHorizontal: 20,
        elevation: 10,
        zIndex: 9999,
    },
    title: {
        fontWeight: "bold",
        fontSize: 20,
        marginBottom: 20,
    },
    item: {
        paddingVertical: 14,
    },
    text: {
        fontSize: 17,
    },
});
