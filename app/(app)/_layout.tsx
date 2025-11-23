import { Stack } from "expo-router";
import React from "react";
import Header from "../components/Header";

export default function AppLayout() {
  return (
    <>
      <Header />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
