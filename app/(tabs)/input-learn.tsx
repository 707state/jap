import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
type LearningState = "input" | "correct" | "incorrect" | "completed";

// 学习记录
interface LearningRecord {
  kanaId: string;
  attempts: number;
  correct: boolean;
  lastAnswer: string;
}

export default function InputLearnScreen() {
  const colorScheme = useColorScheme();
  const [kanaData, setKanaData] = useState<KanaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [learningMode, setLearningMode] = useState<LearningMode>("hiragana");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [learningState, setLearningState] = useState<LearningState>("input");
  const [learningRecords, setLearningRecords] = useState<LearningRecord[]>([]);
  const [wrongAnswers, setWrongAnswers] = useState<KanaData[]>([]);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);

  const inputRef = useRef<TextInput>(null);

  // 加载数据
  useEffect(() => {
    loadKanaData();
  }, []);

  const loadKanaData = async () => {
    try {
      const data = require("@/assets/raw/data.json");
      setKanaData(data);
      setLoading(false);
      // 初始化学习记录
      const initialRecords = data.map((kana: KanaData) => ({
        kanaId: kana.id,
        attempts: 0,
        correct: false,
        lastAnswer: "",
      }));
      setLearningRecords(initialRecords);
    } catch (error) {
      console.error("Failed to load kana data:", error);
      Alert.alert("错误", "无法加载假名数据");
      setLoading(false);
    }
  };

  // 获取当前假名
  const getCurrentKana = () => {
    if (isReviewMode && wrongAnswers.length > 0) {
      return wrongAnswers[currentIndex];
    }
    return kanaData[currentIndex];
  };

  // 获取显示的假名
  const getDisplayKana = () => {
    const currentKana = getCurrentKana();
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

  // 验证用户输入
  const validateInput = () => {
    const currentKana = getCurrentKana();
    if (!currentKana || !userInput.trim()) return;

    const userAnswer = userInput.trim().toLowerCase();
    const correctAnswer = currentKana.answer.toLowerCase();
    const isCorrect = userAnswer === correctAnswer;

    // 更新学习记录
    const recordIndex = learningRecords.findIndex(
      (record) => record.kanaId === currentKana.id,
    );

    if (recordIndex !== -1) {
      const newRecords = [...learningRecords];
      newRecords[recordIndex] = {
        ...newRecords[recordIndex],
        attempts: newRecords[recordIndex].attempts + 1,
        correct: isCorrect,
        lastAnswer: userAnswer,
      };
      setLearningRecords(newRecords);
    }

    // 更新统计
    setTotalAttempts((prev) => prev + 1);
    if (isCorrect) {
      setScore((prev) => prev + 1);

      // 如果是在复习模式中答对，从错误列表中移除
      if (isReviewMode) {
        const newWrongAnswers = [...wrongAnswers];
        newWrongAnswers.splice(currentIndex, 1);
        setWrongAnswers(newWrongAnswers);

        // 如果错误列表为空，退出复习模式
        if (newWrongAnswers.length === 0) {
          setIsReviewMode(false);
          setLearningState("completed");
          return;
        }

        // 如果删除后当前索引超出范围，回到第一个
        if (currentIndex >= newWrongAnswers.length) {
          setCurrentIndex(0);
        }
      }

      setLearningState("correct");
    } else {
      // 添加到错误列表（如果不在列表中）
      if (!wrongAnswers.some((kana) => kana.id === currentKana.id)) {
        setWrongAnswers((prev) => [...prev, currentKana]);
      }
      setLearningState("incorrect");
    }
  };

  // 处理下一个
  const handleNext = () => {
    if (learningState === "correct") {
      // 正确时自动进入下一个
      moveToNext();
    } else if (learningState === "incorrect") {
      // 错误时重新输入
      setLearningState("input");
      setUserInput("");
      inputRef.current?.focus();
    }
  };

  // 移动到下一个假名
  const moveToNext = () => {
    const totalItems = isReviewMode ? wrongAnswers.length : kanaData.length;

    if (currentIndex < totalItems - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // 如果是复习模式且还有错误，继续复习
      if (isReviewMode && wrongAnswers.length > 0) {
        setCurrentIndex(0);
      } else {
        // 否则进入完成状态
        setLearningState("completed");
      }
    }

    setLearningState("input");
    setUserInput("");
    inputRef.current?.focus();
  };

  // 显示正确答案
  const showAnswer = () => {
    const currentKana = getCurrentKana();
    if (currentKana) {
      Alert.alert("正确答案", `这个假名的正确读音是：${currentKana.answer}`, [
        { text: "确定", onPress: () => moveToNext() },
      ]);
    }
  };

  // 开始复习错误
  const startReview = () => {
    if (wrongAnswers.length === 0) {
      Alert.alert("提示", "目前没有错误需要复习！");
      return;
    }

    setIsReviewMode(true);
    setCurrentIndex(0);
    setLearningState("input");
    setUserInput("");
    inputRef.current?.focus();
  };

  // 重置学习
  const resetLearning = () => {
    setCurrentIndex(0);
    setUserInput("");
    setLearningState("input");
    setWrongAnswers([]);
    setIsReviewMode(false);
    setScore(0);
    setTotalAttempts(0);

    // 重置学习记录
    const resetRecords = kanaData.map((kana) => ({
      kanaId: kana.id,
      attempts: 0,
      correct: false,
      lastAnswer: "",
    }));
    setLearningRecords(resetRecords);

    inputRef.current?.focus();
  };

  // 获取当前进度
  const getProgress = () => {
    const total = kanaData.length;
    const learned = learningRecords.filter((record) => record.correct).length;
    return {
      learned,
      total,
      percentage: total > 0 ? Math.round((learned / total) * 100) : 0,
    };
  };

  // 获取准确率
  const getAccuracy = () => {
    if (totalAttempts === 0) return 0;
    return Math.round((score / totalAttempts) * 100);
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

  const currentKana = getCurrentKana();
  const progress = getProgress();
  const accuracy = getAccuracy();

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* 头部信息 */}
          <View style={styles.header}>
            <ThemedText type="title">输入学习模式</ThemedText>
            <ThemedText style={styles.subtitle}>
              {isReviewMode ? "复习错误假名" : "输入假名读音进行测试"}
            </ThemedText>

            {/* 学习模式选择 */}
            <View style={styles.modeSelector}>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  learningMode === "hiragana" && styles.activeModeButton,
                ]}
                onPress={() => {
                  setLearningMode("hiragana");
                  setLearningState("input");
                  setUserInput("");
                }}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    learningMode === "hiragana" && styles.activeModeButtonText,
                  ]}
                >
                  平假名
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modeButton,
                  learningMode === "katakana" && styles.activeModeButton,
                ]}
                onPress={() => {
                  setLearningMode("katakana");
                  setLearningState("input");
                  setUserInput("");
                }}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    learningMode === "katakana" && styles.activeModeButtonText,
                  ]}
                >
                  片假名
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modeButton,
                  learningMode === "mixed" && styles.activeModeButton,
                ]}
                onPress={() => {
                  setLearningMode("mixed");
                  setLearningState("input");
                  setUserInput("");
                }}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    learningMode === "mixed" && styles.activeModeButtonText,
                  ]}
                >
                  混合
                </Text>
              </TouchableOpacity>
            </View>

            {/* 统计信息 */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statLabel}>进度</ThemedText>
                <ThemedText style={styles.statValue}>
                  {progress.learned}/{progress.total} ({progress.percentage}%)
                </ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statLabel}>准确率</ThemedText>
                <ThemedText style={styles.statValue}>{accuracy}%</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statLabel}>错误</ThemedText>
                <ThemedText style={styles.statValue}>
                  {wrongAnswers.length}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* 主学习区域 */}
          <View style={styles.mainContent}>
            {/* 假名显示 */}
            <View style={styles.kanaCard}>
              <View style={styles.kanaCharacterContainer}>
                <ThemedText style={styles.kanaCharacter}>
                  {getDisplayKana()}
                </ThemedText>
              </View>

              <ThemedText style={styles.kanaInfo}>
                {isReviewMode
                  ? "复习模式"
                  : `第 ${currentIndex + 1} / ${kanaData.length}`}
              </ThemedText>
            </View>

            {/* 输入区域 */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>
                请输入这个假名的读音：
              </ThemedText>

              <TextInput
                ref={inputRef}
                style={styles.textInput}
                value={userInput}
                onChangeText={setUserInput}
                placeholder="输入罗马音..."
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
                editable={learningState === "input"}
                onSubmitEditing={validateInput}
                returnKeyType="done"
              />

              {/* 反馈信息 */}
              {learningState === "correct" && (
                <View style={styles.feedbackCorrect}>
                  <ThemedText style={styles.feedbackText}>
                    ✓ 正确！答案是：{currentKana?.answer}
                  </ThemedText>
                </View>
              )}

              {learningState === "incorrect" && (
                <View style={styles.feedbackIncorrect}>
                  <ThemedText style={styles.feedbackText}>
                    ✗ 错误！正确答案是：{currentKana?.answer}
                  </ThemedText>
                  <ThemedText style={styles.userAnswerText}>
                    你的答案：{userInput}
                  </ThemedText>
                </View>
              )}

              {learningState === "completed" && (
                <View style={styles.completedContainer}>
                  <ThemedText style={styles.completedTitle}>
                    学习完成！
                  </ThemedText>
                  <ThemedText style={styles.completedText}>
                    你已经学习了所有假名
                  </ThemedText>
                  {wrongAnswers.length > 0 && (
                    <ThemedText style={styles.completedText}>
                      还有 {wrongAnswers.length} 个需要复习
                    </ThemedText>
                  )}
                </View>
              )}
            </View>

            {/* 控制按钮 */}
            <View style={styles.controlButtons}>
              {learningState === "input" && (
                <>
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={validateInput}
                    disabled={!userInput.trim()}
                  >
                    <ThemedText style={styles.submitButtonText}>
                      提交答案
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.showAnswerButton}
                    onPress={showAnswer}
                  >
                    <ThemedText style={styles.showAnswerButtonText}>
                      显示答案
                    </ThemedText>
                  </TouchableOpacity>
                </>
              )}

              {(learningState === "correct" ||
                learningState === "incorrect") && (
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={handleNext}
                >
                  <ThemedText style={styles.nextButtonText}>
                    {learningState === "correct" ? "下一个" : "重新输入"}
                  </ThemedText>
                </TouchableOpacity>
              )}

              {learningState === "completed" && (
                <View style={styles.completedActions}>
                  {wrongAnswers.length > 0 && (
                    <TouchableOpacity
                      style={styles.reviewButton}
                      onPress={startReview}
                    >
                      <ThemedText style={styles.reviewButtonText}>
                        复习错误 ({wrongAnswers.length})
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.restartButton}
                    onPress={resetLearning}
                  >
                    <ThemedText style={styles.restartButtonText}>
                      重新开始
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* 错误列表预览 */}
            {wrongAnswers.length > 0 && learningState !== "completed" && (
              <View style={styles.wrongAnswersPreview}>
                <ThemedText style={styles.wrongAnswersTitle}>
                  需要复习的假名 ({wrongAnswers.length})
                </ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.wrongAnswersList}>
                    {wrongAnswers.map((kana, index) => (
                      <View key={kana.id} style={styles.wrongKanaItem}>
                        <Text style={styles.wrongKanaText}>
                          {learningMode === "katakana"
                            ? kana.kana.katakana
                            : kana.kana.hiragana}
                        </Text>
                        <Text style={styles.wrongKanaRomaji}>
                          {kana.answer}
                        </Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
                <TouchableOpacity
                  style={styles.startReviewButton}
                  onPress={startReview}
                >
                  <ThemedText style={styles.startReviewButtonText}>
                    开始复习
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
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
  },
  activeModeButtonText: {
    color: "white",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 15,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
  },
  kanaCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  kanaCharacterContainer: {
    width: "100%",
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
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
  kanaInfo: {
    fontSize: 14,
    color: "#666",
  },
  inputContainer: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  textInput: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 18,
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
    color: "#333",
    marginBottom: 15,
    minHeight: 60,
  },
  feedbackCorrect: {
    backgroundColor: "#E8F5E9",
    borderWidth: 2,
    borderColor: "#34C759",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
  },
  feedbackIncorrect: {
    backgroundColor: "#FFEBEE",
    borderWidth: 2,
    borderColor: "#FF3B30",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 5,
  },
  userAnswerText: {
    fontSize: 14,
    color: "#333333",
  },
  completedContainer: {
    backgroundColor: "#E3F2FD",
    borderWidth: 2,
    borderColor: "#007AFF",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  completedTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 10,
  },
  completedText: {
    fontSize: 16,
    color: "#000000",
    textAlign: "center",
    marginBottom: 5,
  },
  controlButtons: {
    gap: 12,
    marginBottom: 25,
  },
  submitButton: {
    backgroundColor: "#007AFF",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  showAnswerButton: {
    backgroundColor: "#34C759",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
  },
  showAnswerButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  nextButton: {
    backgroundColor: "#007AFF",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
  },
  nextButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  completedActions: {
    gap: 12,
  },
  reviewButton: {
    backgroundColor: "#FF9500",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
  },
  reviewButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  restartButton: {
    backgroundColor: "#007AFF",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
  },
  restartButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  wrongAnswersPreview: {
    backgroundColor: "#FFF3E0",
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
  },
  wrongAnswersTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  wrongAnswersList: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
  },
  wrongKanaItem: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    minWidth: 60,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  wrongKanaText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  wrongKanaRomaji: {
    fontSize: 12,
    color: "#666",
  },
  startReviewButton: {
    backgroundColor: "#FF9500",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: "center",
  },
  startReviewButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
