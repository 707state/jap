import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  SectionList,
  Dimensions,
} from "react-native";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { SettingsLayout } from "@/components/settings-layout";

// 定义假名数据类型
interface KanaData {
  id: string;
  kana: {
    hiragana: string;
    katakana: string;
  };
  answer: string;
}

// 按行分组的数据结构
interface KanaSection {
  title: string;
  data: KanaData[];
}

export default function KanaListScreen() {
  const colorScheme = useColorScheme();
  const [kanaData, setKanaData] = useState<KanaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKana, setSelectedKana] = useState<KanaData | null>(null);
  const [showMode, setShowMode] = useState<"hiragana" | "katakana" | "both">(
    "both",
  );

  // 加载数据
  useEffect(() => {
    loadKanaData();
  }, []);

  const loadKanaData = async () => {
    try {
      const data = require("@/assets/raw/data.json");
      setKanaData(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load kana data:", error);
      setLoading(false);
    }
  };

  // 按行分组假名数据
  const getGroupedKanaData = (): KanaSection[] => {
    // 日语50音图的传统分组
    const vowelGroup = kanaData.filter((k) =>
      ["a", "i", "u", "e", "o"].includes(k.id),
    );
    const kGroup = kanaData.filter((k) => k.id.startsWith("k"));
    const sGroup = kanaData.filter((k) => k.id.startsWith("s"));
    const tGroup = kanaData.filter((k) => k.id.startsWith("t"));
    const nGroup = kanaData.filter((k) => k.id.startsWith("n"));
    const hGroup = kanaData.filter((k) => k.id.startsWith("h"));
    const mGroup = kanaData.filter((k) => k.id.startsWith("m"));
    const yGroup = kanaData.filter((k) => k.id.startsWith("y"));
    const rGroup = kanaData.filter((k) => k.id.startsWith("r"));
    const wGroup = kanaData.filter((k) => k.id.startsWith("w"));
    const nSpecial = kanaData.filter((k) => k.id === "n");

    const sections: KanaSection[] = [
      { title: "あ行 (元音)", data: vowelGroup },
      { title: "か行 (K)", data: kGroup },
      { title: "さ行 (S)", data: sGroup },
      { title: "た行 (T)", data: tGroup },
      { title: "な行 (N)", data: nGroup },
      { title: "は行 (H)", data: hGroup },
      { title: "ま行 (M)", data: mGroup },
      { title: "や行 (Y)", data: yGroup },
      { title: "ら行 (R)", data: rGroup },
      { title: "わ行 (W)", data: wGroup },
      { title: "ん", data: nSpecial },
    ];

    return sections.filter((section) => section.data.length > 0);
  };

  // 渲染假名卡片
  const renderKanaCard = (item: KanaData) => {
    const isSelected = selectedKana?.id === item.id;
    const isBothMode = showMode === "both";

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.kanaCard,
          isBothMode && styles.kanaCardBoth,
          isSelected && styles.selectedKanaCard,
        ]}
        onPress={() => setSelectedKana(isSelected ? null : item)}
      >
        <View style={styles.kanaContent}>
          {/* 根据显示模式显示假名 */}
          {showMode !== "katakana" && (
            <Text
              style={[
                styles.hiraganaText,
                showMode === "both" && styles.hiraganaTextBoth,
              ]}
            >
              {item.kana.hiragana}
            </Text>
          )}

          {showMode !== "hiragana" && (
            <Text
              style={[
                styles.katakanaText,
                showMode === "both" && styles.katakanaTextBoth,
              ]}
            >
              {item.kana.katakana}
            </Text>
          )}

          <Text
            style={[
              styles.romajiText,
              showMode === "both" && styles.romajiTextBoth,
            ]}
          >
            {item.answer}
          </Text>
        </View>

        {isSelected && (
          <View style={styles.detailInfo}>
            <Text style={styles.detailText}>ID: {item.id}</Text>
            <Text style={styles.detailText}>罗马音: {item.answer}</Text>
            <Text style={styles.detailText}>平假名: {item.kana.hiragana}</Text>
            <Text style={styles.detailText}>片假名: {item.kana.katakana}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // 渲染分组标题
  const renderSectionHeader = ({ section }: { section: KanaSection }) => (
    <View style={styles.sectionHeader}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        {section.title}
      </ThemedText>
    </View>
  );

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>加载中...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SettingsLayout>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.container}>
          {/* 头部 */}
          <View style={styles.header}>
            <ThemedText type="title">日语50音表</ThemedText>
            <ThemedText style={styles.subtitle}>
              点击假名查看详细信息，共 {kanaData.length} 个假名
            </ThemedText>

            {/* 显示模式选择 */}
            <View style={styles.modeSelector}>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  showMode === "both" && styles.activeModeButton,
                ]}
                onPress={() => setShowMode("both")}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    showMode === "both" && styles.activeModeButtonText,
                  ]}
                >
                  全部显示
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modeButton,
                  showMode === "hiragana" && styles.activeModeButton,
                ]}
                onPress={() => setShowMode("hiragana")}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    showMode === "hiragana" && styles.activeModeButtonText,
                  ]}
                >
                  仅平假名
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modeButton,
                  showMode === "katakana" && styles.activeModeButton,
                ]}
                onPress={() => setShowMode("katakana")}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    showMode === "katakana" && styles.activeModeButtonText,
                  ]}
                >
                  仅片假名
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 假名列表 */}
          <SectionList
            sections={getGroupedKanaData()}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => renderKanaCard(item)}
            renderSectionHeader={renderSectionHeader}
            stickySectionHeadersEnabled={true}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          {/* 选中的假名详情 */}
          {selectedKana && (
            <View style={styles.selectedDetail}>
              <ThemedText type="subtitle">详细信息</ThemedText>
              <View style={styles.detailGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>平假名</Text>
                  <Text style={styles.detailValue}>
                    {selectedKana.kana.hiragana}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>片假名</Text>
                  <Text style={styles.detailValue}>
                    {selectedKana.kana.katakana}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>罗马音</Text>
                  <Text style={styles.detailValue}>{selectedKana.answer}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>ID</Text>
                  <Text style={styles.detailValue}>{selectedKana.id}</Text>
                </View>
              </View>
            </View>
          )}
        </ThemedView>
      </SafeAreaView>
    </SettingsLayout>
  );
}

const { width } = Dimensions.get("window");
const cardSize = (width - 50) / 4; // 每行4个卡片，更大的格子

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 15,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
    marginBottom: 15,
  },
  modeSelector: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
    gap: 8,
  },
  modeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
  },
  activeModeButton: {
    backgroundColor: "#007AFF",
  },
  modeButtonText: {
    fontSize: 12,
    fontWeight: "500",
  },
  activeModeButtonText: {
    color: "white",
  },
  listContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    backgroundColor: "#F8F9FA",
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  sectionTitle: {
    fontSize: 16,
    color: "#333",
  },
  kanaCard: {
    width: cardSize,
    height: cardSize * 1.2, // 默认高度
    backgroundColor: "white",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    margin: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  kanaCardBoth: {
    height: cardSize * 1.5, // 同时显示平假名和片假名时需要更高
  },
  selectedKanaCard: {
    backgroundColor: "#E3F2FD",
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  kanaContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  hiraganaText: {
    fontSize: cardSize * 0.45,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  hiraganaTextBoth: {
    fontSize: cardSize * 0.35,
    marginBottom: 1,
  },
  katakanaText: {
    fontSize: cardSize * 0.4,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 2,
  },
  katakanaTextBoth: {
    fontSize: cardSize * 0.3,
    marginBottom: 1,
  },
  romajiText: {
    fontSize: cardSize * 0.25,
    color: "#007AFF",
    fontWeight: "600",
    marginTop: 4,
  },
  romajiTextBoth: {
    fontSize: cardSize * 0.2,
    marginTop: 2,
  },
  detailInfo: {
    position: "absolute",
    bottom: -80,
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.84,
    elevation: 6,
    minWidth: 140,
    zIndex: 10,
  },
  detailText: {
    fontSize: 13,
    color: "#333",
    marginBottom: 2,
  },
  selectedDetail: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  detailItem: {
    width: "48%",
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});
