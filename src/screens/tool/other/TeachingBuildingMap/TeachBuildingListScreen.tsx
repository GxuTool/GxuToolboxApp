import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Text, useTheme } from "@rneui/themed";
import { TeachBuildingList } from "./data";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "@/components/un-ui/Icon.tsx";

export function TeachBuildingListScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [expandedBuildingId, setExpandedBuildingId] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <FlatList
        data={TeachBuildingList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.section}>
            <Pressable
              style={styles.item}
              onPress={() =>
                setExpandedBuildingId((current) => (current === item.id ? null : item.id))
              }
            >
              <View style={styles.titleRow}>
                <Text style={[styles.itemText, { color: theme.colors.black }]}>
                  {item.name}
                </Text>
                <Icon
                  name={expandedBuildingId === item.id ? "chevron-down" : "chevron-right"}
                  size={22}
                  color={theme.colors.black}
                />
              </View>
            </Pressable>
            {expandedBuildingId === item.id && (
              <View style={styles.floorList}>
                {item.floors.map((floor) => (
                  <Pressable
                    key={floor.id}
                    style={styles.floorItem}
                    onPress={() => navigation.navigate("FloorMapScreen", { floor })}
                  >
                    <Text style={[styles.floorText, { color: theme.colors.black }]}>
                      {floor.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  section: {
    marginBottom: 12,
  },
  item: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemText: {
    fontSize: 16,
    fontWeight: "600",
  },
  floorList: {
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  floorItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
    backgroundColor: "#f3f4f6",
  },
  floorText: {
    fontSize: 15,
    fontWeight: "500",
  },
});
