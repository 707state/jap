import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
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

// 测验类型
type QuizType = "hiragana" | "katakana" | "mixed";
type QuizState = "idle" | "question" | "answer" | "result";

export default function QuizScreen() {
  const colorScheme = useColorScheme();
  const [kanaData, setKanaData] = useState<KanaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizType, setQuizType] = useState<QuizType>("hiragana");
  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [questions, setQuestions] = useState<KanaData[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

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
      Alert.alert("错误", "无法加载假名数据");
      setLoading(false);
    }
  };

  // 开始测验
  const startQuiz = (type: QuizType) => {
    setQuizType(type);

    // 随机选择10个问题
    const shuffled = [...kanaData].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, Math.min(10, kanaData.length));
    setQuestions(selectedQuestions);
    setCurrentQuestion(0);
    setScore(0);
    setQuizState("question");
    generateOptions(selectedQuestions[0]);
  };

  // 生成选项
  const generateOptions = (question: KanaData) => {
    // 正确答案
    const correctAnswer = question.answer;

    // 随机选择3个错误答案
    const wrongAnswers = kanaData
      .filter((k) => k.answer !== correctAnswer)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((k) => k.answer);

    // 合并并随机排序
    const allOptions = [correctAnswer, ...wrongAnswers];
    const shuffledOptions = [...allOptions].sort(() => Math.random() - 0.5);

    setOptions(shuffledOptions);
    setSelectedOption(null);
    setIsCorrect(null);
  };

  // 获取当前显示的假名
  const getDisplayKana = (kana: KanaData) => {
    switch (quizType) {
      case "hiragana":
        return kana.kana.hiragana;
      case "katakana":
        return kana.kana.katakana;
      case "mixed":
        return Math.random() > 0.5 ? kana.kana.hiragana : kana.kana.katakana;
      default:
        return kana.kana.hiragana;
    }
  };

  // 选择答案
  const selectAnswer = (option: string) => {
    if (quizState !== "question") return;

    setSelectedOption(option);
    const correct = option === questions[currentQuestion].answer;
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 1);
    }

    setQuizState("answer");
  };

  // 下一题
  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      generateOptions(questions[currentQuestion + 1]);
      setQuizState("question");
    } else {
      setQuizState("result");
    }
  };

  // 重新开始
  const restartQuiz = () => {
    setQuizState("idle");
    setCurrentQuestion(0);
    setScore(0);
    setSelectedOption(null);
    setIsCorrect(null);
  };

  // 获取测验类型名称
  const getQuizTypeName = (type: QuizType) => {
    switch (type) {
      case "hiragana":
        return "平假名测验";
      case "katakana":
        return "片假名测验";
      case "mixed":
        return "混合测验";
      default:
        return "测验";
    }
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
        {/* 头部 */}
        <View style={styles.header}>
          <ThemedText type="title">日语50音测验</ThemedText>
          <ThemedText style={styles.subtitle}>
            测试你对日语假名的掌握程度
          </ThemedText>
        </View>

        {/* 测验状态显示 */}
        {quizState === "idle" && (
          <View style={styles.quizSelection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              选择测验类型
            </ThemedText>

            <TouchableOpacity
              style={styles.quizTypeButton}
              onPress={() => startQuiz("hiragana")}
            >
              <ThemedText style={styles.quizTypeButtonText}>
                平假名测验
              </ThemedText>
              <ThemedText style={styles.quizTypeDescription}>
                测试平假名识别能力
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quizTypeButton}
              onPress={() => startQuiz("katakana")}
            >
              <ThemedText style={styles.quizTypeButtonText}>
                片假名测验
              </ThemedText>
              <ThemedText style={styles.quizTypeDescription}>
                测试片假名识别能力
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quizTypeButton}
              onPress={() => startQuiz("mixed")}
            >
              <ThemedText style={styles.quizTypeButtonText}>
                混合测验
              </ThemedText>
              <ThemedText style={styles.quizTypeDescription}>
                混合平假名和片假名
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* 测验进行中 */}
        {(quizState === "question" || quizState === "answer") && (
          <View style={styles.quizInProgress}>
            {/* 进度显示 */}
            <View style={styles.progressContainer}>
              <ThemedText style={styles.progressText}>
                第 {currentQuestion + 1} / {questions.length} 题
              </ThemedText>
              <ThemedText style={styles.scoreText}>得分: {score}</ThemedText>
            </View>

            {/* 问题显示 */}
            <View style={styles.questionCard}>
              <ThemedText style={styles.questionTitle}>
                这个假名的罗马音是什么？
              </ThemedText>
              <ThemedText style={styles.kanaCharacter}>
                {getDisplayKana(questions[currentQuestion])}
              </ThemedText>
            </View>

            {/* 选项 */}
            <View style={styles.optionsContainer}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    selectedOption === option && styles.selectedOption,
                    quizState === "answer" &&
                      option === questions[currentQuestion].answer &&
                      styles.correctOption,
                    quizState === "answer" &&
                      selectedOption === option &&
                      option !== questions[currentQuestion].answer &&
                      styles.wrongOption,
                  ]}
                  onPress={() => selectAnswer(option)}
                  disabled={quizState === "answer"}
                >
                  <ThemedText
                    style={[
                      styles.optionText,
                      selectedOption === option && styles.selectedOptionText,
                      quizState === "answer" &&
                        option === questions[currentQuestion].answer &&
                        styles.correctOptionText,
                    ]}
                  >
                    {option}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            {/* 答案反馈 */}
            {quizState === "answer" && (
              <View
                style={[
                  styles.feedbackContainer,
                  isCorrect ? styles.correctFeedback : styles.wrongFeedback,
                ]}
              >
                <ThemedText style={styles.feedbackText}>
                  {isCorrect ? "✓ 回答正确！" : "✗ 回答错误"}
                </ThemedText>
                <ThemedText style={styles.correctAnswerText}>
                  正确答案: {questions[currentQuestion].answer}
                </ThemedText>
                <ThemedText style={styles.kanaInfoText}>
                  平假名: {questions[currentQuestion].kana.hiragana} | 片假名:{" "}
                  {questions[currentQuestion].kana.katakana}
                </ThemedText>

                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={nextQuestion}
                >
                  <ThemedText style={styles.nextButtonText}>
                    {currentQuestion < questions.length - 1
                      ? "下一题"
                      : "查看结果"}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* 测验结果 */}
        {quizState === "result" && (
          <View style={styles.resultContainer}>
            <ThemedText type="title" style={styles.resultTitle}>
              测验完成！
            </ThemedText>

            <View style={styles.scoreCard}>
              <ThemedText style={styles.finalScore}>
                {score} / {questions.length}
              </ThemedText>
              <ThemedText style={styles.scorePercentage}>
                {Math.round((score / questions.length) * 100)}%
              </ThemedText>
            </View>

            <ThemedText style={styles.resultMessage}>
              {score === questions.length
                ? "太棒了！全部答对！"
                : score >= questions.length * 0.8
                  ? "很好！继续努力！"
                  : score >= questions.length * 0.6
                    ? "不错！还需要多练习"
                    : "加油！再多练习几次"}
            </ThemedText>

            <View style={styles.resultActions}>
              <TouchableOpacity
                style={styles.restartButton}
                onPress={restartQuiz}
              >
                <ThemedText style={styles.restartButtonText}>
                  重新测验
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.changeTypeButton}
                onPress={() => setQuizState("idle")}
              >
                <ThemedText style={styles.changeTypeButtonText}>
                  选择其他测验
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ThemedView>
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
  },
  quizSelection: {
    flex: 1,
    justifyContent: "center",
  },
  sectionTitle: {
    textAlign: "center",
    marginBottom: 30,
  },
  quizTypeButton: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quizTypeButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  quizTypeDescription: {
    fontSize: 14,
    color: "#666",
  },
  quizInProgress: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    color: "#666",
  },
  scoreText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  questionCard: {
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
  questionTitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
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
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 18,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedOption: {
    borderColor: "#007AFF",
    backgroundColor: "#E3F2FD",
  },
  correctOption: {
    borderColor: "#34C759",
    backgroundColor: "#E8F5E9",
  },
  wrongOption: {
    borderColor: "#FF3B30",
    backgroundColor: "#FFEBEE",
  },
  optionText: {
    fontSize: 18,
    textAlign: "center",
    color: "#333",
  },
  selectedOptionText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  correctOptionText: {
    color: "#34C759",
    fontWeight: "600",
  },
  feedbackContainer: {
    marginTop: 30,
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
  },
  correctFeedback: {
    backgroundColor: "#E8F5E9",
    borderWidth: 2,
    borderColor: "#34C759",
  },
  wrongFeedback: {
    backgroundColor: "#FFEBEE",
    borderWidth: 2,
    borderColor: "#FF3B30",
  },
  feedbackText: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
  },
  correctAnswerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  kanaInfoText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: "#007AFF",
    borderRadius: 25,
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  resultContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  resultTitle: {
    marginBottom: 30,
  },
  scoreCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  finalScore: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#333",
  },
  scorePercentage: {
    fontSize: 24,
    color: "#007AFF",
    marginTop: 10,
  },
  resultMessage: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 28,
  },
  resultActions: {
    flexDirection: "row",
    gap: 15,
  },
  restartButton: {
    backgroundColor: "#007AFF",
    borderRadius: 25,
    paddingHorizontal: 25,
    paddingVertical: 12,
  },
  restartButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  changeTypeButton: {
    backgroundColor: "#34C759",
    borderRadius: 25,
    paddingHorizontal: 25,
    paddingVertical: 12,
  },
  changeTypeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
