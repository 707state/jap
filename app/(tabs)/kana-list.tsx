import { SettingsLayout } from "@/components/settings-layout";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  SafeAreaView,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

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
  const [showDetailModal, setShowDetailModal] = useState(false);

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
    const tGroup = kanaData.filter(
      (k) => k.id.startsWith("t") || k.id.startsWith("c"),
    );
    const nGroup = kanaData.filter((k) => k.id.startsWith("n"));
    const hGroup = kanaData.filter(
      (k) => k.id.startsWith("h") || k.id.startsWith("f"),
    );
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
    const isBothMode = showMode === "both";

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.kanaCard,
          isBothMode && styles.kanaCardBoth,
        ]}
        onPress={() => {
          setSelectedKana(item);
          setShowDetailModal(true);
        }}
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
      </TouchableOpacity>
    );
  };

  // 关闭详情模态框
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedKana(null);
  };

  // 渲染详情模态框
  const renderDetailModal = () => {
    if (!selectedKana) return null;

    return (
      <Modal
        visible={showDetailModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeDetailModal}
      >
        <TouchableWithoutFeedback onPress={closeDetailModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                {/* 关闭按钮 */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeDetailModal}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>

                <Text style={styles.modalTitle}>假名详情</Text>

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
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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

          {/* 详情模态框 */}
          {renderDetailModal()}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    width: width * 0.85,
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  detailItem: {
    width: "48%",
    marginBottom: 15,
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    padding: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});
