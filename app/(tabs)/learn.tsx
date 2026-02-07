import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Alert,
} from "react-native";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

// 定义假名数据类型
interface KanaData {
  id: string;
  kana: {
    hiragana: string;
    katakana: string;
  };
  answer: string;
}

// 学习模式
type LearningMode = "hiragana" | "katakana" | "mixed";
type DisplayMode = "show" | "hide" | "quiz";

export default function LearnScreen() {
  const colorScheme = useColorScheme();
  const [kanaData, setKanaData] = useState<KanaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [learningMode, setLearningMode] = useState<LearningMode>("hiragana");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("show");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [learnedCount, setLearnedCount] = useState(0);

  // 加载数据
  useEffect(() => {
    loadKanaData();
  }, []);

  const loadKanaData = async () => {
    try {
      // 从本地文件加载数据
      const data = require("@/assets/raw/data.json");
      setKanaData(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load kana data:", error);
      Alert.alert("错误", "无法加载假名数据");
      setLoading(false);
    }
  };

  // 获取当前假名
  const currentKana = kanaData[currentIndex];

  // 获取显示的假名
  const getDisplayKana = () => {
    if (!currentKana) return "";

    switch (learningMode) {
      case "hiragana":
        return currentKana.kana.hiragana;
      case "katakana":
        return currentKana.kana.katakana;
      case "mixed":
        // 随机显示平假名或片假名
        return Math.random() > 0.5
          ? currentKana.kana.hiragana
          : currentKana.kana.katakana;
      default:
        return currentKana.kana.hiragana;
    }
  };

  // 导航到下一个假名
  const goToNext = () => {
    if (currentIndex < kanaData.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      // 回到第一个
      setCurrentIndex(0);
      setShowAnswer(false);
    }
  };

  // 导航到上一个假名
  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  // 标记为已学习
  const markAsLearned = () => {
    if (!showAnswer) {
      setShowAnswer(true);
      setLearnedCount((prev) => prev + 1);
    }
  };

  // 重置学习进度
  const resetProgress = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setLearnedCount(0);
  };

  // 获取进度百分比
  const getProgressPercentage = () => {
    if (kanaData.length === 0) return 0;
    return Math.round((learnedCount / kanaData.length) * 100);
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>加载中...</ThemedText>
      </ThemedView>
    );
  }

  if (kanaData.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>没有找到假名数据</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        {/* 头部控制区域 */}
        <View style={styles.header}>
          <ThemedText type="title">日语50音学习</ThemedText>

          {/* 学习模式选择 */}
          <View style={styles.modeSelector}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                learningMode === "hiragana" && styles.activeModeButton,
              ]}
              onPress={() => setLearningMode("hiragana")}
            >
              <ThemedText
                style={[
                  styles.modeButtonText,
                  learningMode === "hiragana" && styles.activeModeButtonText,
                ]}
              >
                平假名
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                learningMode === "katakana" && styles.activeModeButton,
              ]}
              onPress={() => setLearningMode("katakana")}
            >
              <ThemedText
                style={[
                  styles.modeButtonText,
                  learningMode === "katakana" && styles.activeModeButtonText,
                ]}
              >
                片假名
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                learningMode === "mixed" && styles.activeModeButton,
              ]}
              onPress={() => setLearningMode("mixed")}
            >
              <ThemedText
                style={[
                  styles.modeButtonText,
                  learningMode === "mixed" && styles.activeModeButtonText,
                ]}
              >
                混合
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* 进度显示 */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${getProgressPercentage()}%` },
                ]}
              />
            </View>
            <ThemedText style={styles.progressText}>
              {learnedCount} / {kanaData.length} ({getProgressPercentage()}%)
            </ThemedText>
          </View>
        </View>

        {/* 增加间距的空白区域 */}
        <View style={styles.spacer} />

        {/* 主学习区域 */}
        <View style={styles.mainContent}>
          {/* 假名卡片 */}
          <View style={styles.kanaCard}>
            <View style={styles.kanaCharacterContainer}>
              <ThemedText style={styles.kanaCharacter}>
                {getDisplayKana()}
              </ThemedText>
            </View>

            {showAnswer && (
              <View style={styles.answerContainer}>
                <ThemedText style={styles.answerLabel}>罗马音：</ThemedText>
                <ThemedText style={styles.answerText}>
                  {currentKana.answer}
                </ThemedText>
              </View>
            )}
          </View>

          {/* 控制按钮 */}
          <View style={styles.controlButtons}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={goToPrevious}
              disabled={currentIndex === 0}
            >
              <ThemedText
                style={[
                  styles.navButtonText,
                  currentIndex === 0 && styles.disabledButtonText,
                ]}
              >
                上一个
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.showAnswerButton}
              onPress={markAsLearned}
            >
              <ThemedText style={styles.showAnswerButtonText}>
                {showAnswer ? "已学习" : "显示答案"}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navButton} onPress={goToNext}>
              <ThemedText style={styles.navButtonText}>下一个</ThemedText>
            </TouchableOpacity>
          </View>

          {/* 假名信息 */}
          <View style={styles.kanaInfo}>
            <ThemedText style={styles.kanaInfoText}>
              当前: {currentIndex + 1} / {kanaData.length}
            </ThemedText>
            <ThemedText style={styles.kanaInfoText}>
              ID: {currentKana.id}
            </ThemedText>
          </View>
        </View>

        {/* 底部操作区域 */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.resetButton} onPress={resetProgress}>
            <ThemedText style={styles.resetButtonText}>重置进度</ThemedText>
          </TouchableOpacity>
        </View>

        {/* 说明区域 */}
        <View style={styles.instructions}>
          <ThemedText style={styles.instructionText}>
            • 点击&quot;显示答案&quot;查看罗马音并标记为已学习
          </ThemedText>
          <ThemedText style={styles.instructionText}>
            • 使用&quot;上一个&quot;/&quot;下一个&quot;按钮导航
          </ThemedText>
          <ThemedText style={styles.instructionText}>
            • 选择不同的学习模式：平假名、片假名或混合
          </ThemedText>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 10,
  },
  modeSelector: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 15,
    gap: 10,
  },
  modeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  activeModeButton: {
    backgroundColor: "#007AFF",
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "gray",
  },
  activeModeButtonText: {
    color: "white",
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 5,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#34C759",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  kanaCard: {
    width: width * 0.85,
    height: width * 0.85,
    backgroundColor: "white",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 30,
    padding: 20,
  },
  kanaCharacter: {
    fontSize: 140,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
    lineHeight: 140,
  },
  kanaCharacterContainer: {
    width: "100%",
    height: 160,
    justifyContent: "center",
    alignItems: "center",
  },
  answerContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  answerLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  answerText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#007AFF",
  },
  controlButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  navButton: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    minWidth: 100,
    alignItems: "center",
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  disabledButtonText: {
    color: "#999",
  },
  showAnswerButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: "#007AFF",
    borderRadius: 25,
    minWidth: 120,
    alignItems: "center",
  },
  showAnswerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  kanaInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
  },
  kanaInfoText: {
    fontSize: 14,
    color: "#666",
  },
  footer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  resetButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#FF3B30",
    borderRadius: 20,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  instructions: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
  },
  spacer: {
    height: 20,
  },
  instructionText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
});
