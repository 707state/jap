import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  FlatList,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { SettingsLayout } from "@/components/settings-layout";

import Tts from "react-native-tts";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 定义词汇数据类型
interface VocabularyItem {
  id: string;
  japanese: string; // 日文词汇
  kana: string; // 假名读音
  romaji: string; // 罗马字
  meaning: string; // 中文意思
  category: string; // 分类
  tags: string[]; // 标签
  createdAt: string; // 创建时间
  lastReviewed: string; // 最后复习时间
  reviewCount: number; // 复习次数
}

// 分类选项
const CATEGORIES = [
  "日常用语",
  "工作相关",
  "旅游用语",
  "美食相关",
  "购物用语",
  "交通相关",
  "学习用语",
  "其他",
];

export default function VocabularyScreen() {
  const [vocabularyList, setVocabularyList] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsAvailable, setTtsAvailable] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<VocabularyItem | null>(null);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("全部");

  // 新词汇表单状态
  const [newVocabulary, setNewVocabulary] = useState({
    japanese: "",
    kana: "",
    romaji: "",
    meaning: "",
    category: "日常用语",
    tags: [] as string[],
  });

  // 初始化 TTS（复用 learn.tsx 的逻辑）
  const initializeTts = async () => {
    try {
      let default_engine = await Tts.setDefaultEngine("com.google.android.tts");
      if (!default_engine) {
        setTtsAvailable(false);
        return;
      }
      await Tts.getInitStatus();

      const voices = await Tts.voices();
      const available = voices.filter((v) => !v.notInstalled);

      if (available.length === 0) {
        setTtsAvailable(false);
        console.warn("No TTS voices available");
        return;
      }

      // 设置日语语音
      const japaneseVoices = voices.filter(
        (voice) =>
          voice.language.includes("ja") || voice.language.includes("JP"),
      );

      if (japaneseVoices.length > 0) {
        await Tts.setDefaultVoice(japaneseVoices[0].id);
      }

      await Tts.setDefaultLanguage("ja-JP");
      await Tts.setDefaultRate(0.5);
      await Tts.setDefaultPitch(1.0);
      setTtsAvailable(true);
    } catch (error) {
      console.error("Failed to initialize TTS:", error);
      setTtsAvailable(false);
    }
  };

  // 朗读词汇
  const speakVocabulary = async (text: string) => {
    if (isSpeaking || !ttsAvailable) return;

    try {
      setIsSpeaking(true);

      // 先停止任何正在进行的语音
      await Tts.stop();

      // 设置语音参数
      await Tts.setDefaultLanguage("ja-JP");
      await Tts.setDefaultRate(0.5);
      await Tts.setDefaultPitch(1.0);

      // 朗读
      await Tts.speak(text);
    } catch (error) {
      console.error("Failed to speak:", error);
      setIsSpeaking(false);
      Alert.alert("语音错误", "无法朗读词汇，请检查系统语音设置");
    }
  };

  // 加载词汇数据
  const loadVocabulary = async () => {
    try {
      setLoading(true);
      const storedData = await AsyncStorage.getItem("@vocabulary_list");

      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setVocabularyList(parsedData);
      } else {
        // 如果没有数据，初始化一些示例词汇
        const sampleData: VocabularyItem[] = [
          {
            id: "1",
            japanese: "こんにちは",
            kana: "こんにちは",
            romaji: "konnichiwa",
            meaning: "你好",
            category: "日常用语",
            tags: ["问候", "基础"],
            createdAt: new Date().toISOString(),
            lastReviewed: new Date().toISOString(),
            reviewCount: 0,
          },
          {
            id: "2",
            japanese: "ありがとう",
            kana: "ありがとう",
            romaji: "arigatou",
            meaning: "谢谢",
            category: "日常用语",
            tags: ["感谢", "基础"],
            createdAt: new Date().toISOString(),
            lastReviewed: new Date().toISOString(),
            reviewCount: 0,
          },
          {
            id: "3",
            japanese: "すみません",
            kana: "すみません",
            romaji: "sumimasen",
            meaning: "对不起/打扰一下",
            category: "日常用语",
            tags: ["道歉", "礼貌"],
            createdAt: new Date().toISOString(),
            lastReviewed: new Date().toISOString(),
            reviewCount: 0,
          },
        ];

        setVocabularyList(sampleData);
        await AsyncStorage.setItem(
          "@vocabulary_list",
          JSON.stringify(sampleData),
        );
      }
    } catch (error) {
      console.error("Failed to load vocabulary:", error);
      Alert.alert("加载错误", "无法加载词汇数据");
    } finally {
      setLoading(false);
    }
  };

  // 保存词汇数据
  const saveVocabulary = async (list: VocabularyItem[]) => {
    try {
      await AsyncStorage.setItem("@vocabulary_list", JSON.stringify(list));
    } catch (error) {
      console.error("Failed to save vocabulary:", error);
      Alert.alert("保存错误", "无法保存词汇数据");
    }
  };

  // 添加新词汇
  const handleAddVocabulary = async () => {
    if (!newVocabulary.japanese.trim() || !newVocabulary.meaning.trim()) {
      Alert.alert("输入错误", "请填写日文词汇和中文意思");
      return;
    }

    const newItem: VocabularyItem = {
      id: Date.now().toString(),
      japanese: newVocabulary.japanese.trim(),
      kana: newVocabulary.kana.trim(),
      romaji: newVocabulary.romaji.trim(),
      meaning: newVocabulary.meaning.trim(),
      category: newVocabulary.category,
      tags: newVocabulary.tags,
      createdAt: new Date().toISOString(),
      lastReviewed: new Date().toISOString(),
      reviewCount: 0,
    };

    const updatedList = [...vocabularyList, newItem];
    setVocabularyList(updatedList);
    await saveVocabulary(updatedList);

    // 重置表单
    setNewVocabulary({
      japanese: "",
      kana: "",
      romaji: "",
      meaning: "",
      category: "日常用语",
      tags: [],
    });

    setShowAddModal(false);
    Alert.alert("成功", "词汇已添加");
  };

  // 编辑词汇
  const handleEditVocabulary = async () => {
    if (!editingItem) return;

    const updatedList = vocabularyList.map((item) =>
      item.id === editingItem.id ? editingItem : item,
    );

    setVocabularyList(updatedList);
    await saveVocabulary(updatedList);

    setShowEditModal(false);
    setEditingItem(null);
    Alert.alert("成功", "词汇已更新");
  };

  // 删除词汇
  const handleDeleteVocabulary = (id: string) => {
    Alert.alert("确认删除", "确定要删除这个词汇吗？", [
      { text: "取消", style: "cancel" },
      {
        text: "删除",
        style: "destructive",
        onPress: async () => {
          const updatedList = vocabularyList.filter((item) => item.id !== id);
          setVocabularyList(updatedList);
          await saveVocabulary(updatedList);
        },
      },
    ]);
  };

  // 标记为已复习
  const handleMarkAsReviewed = async (id: string) => {
    const updatedList = vocabularyList.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          lastReviewed: new Date().toISOString(),
          reviewCount: item.reviewCount + 1,
        };
      }
      return item;
    });

    setVocabularyList(updatedList);
    await saveVocabulary(updatedList);
  };

  // 过滤词汇列表
  const filteredVocabulary = vocabularyList.filter((item) => {
    const matchesSearch =
      item.japanese.toLowerCase().includes(searchText.toLowerCase()) ||
      item.kana.toLowerCase().includes(searchText.toLowerCase()) ||
      item.romaji.toLowerCase().includes(searchText.toLowerCase()) ||
      item.meaning.toLowerCase().includes(searchText.toLowerCase()) ||
      item.tags.some((tag) =>
        tag.toLowerCase().includes(searchText.toLowerCase()),
      );

    const matchesCategory =
      selectedCategory === "全部" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // 获取所有分类（包括"全部"）
  const allCategories = ["全部", ...CATEGORIES];

  // 初始化
  useEffect(() => {
    loadVocabulary();
    initializeTts();

    // 清理函数
    return () => {
      Tts.stop();
    };
  }, []);

  // TTS 完成监听
  useEffect(() => {
    let isMounted = true;

    const onTtsFinish = () => {
      if (isMounted) {
        setIsSpeaking(false);
      }
    };

    const onTtsCancel = () => {
      if (isMounted) {
        setIsSpeaking(false);
      }
    };

    Tts.addEventListener("tts-finish", onTtsFinish);
    Tts.addEventListener("tts-cancel", onTtsCancel);

    return () => {
      isMounted = false;
      Tts.removeEventListener("tts-finish", onTtsFinish);
      Tts.removeEventListener("tts-cancel", onTtsCancel);
    };
  }, []);

  // 渲染词汇项
  const renderVocabularyItem = ({ item }: { item: VocabularyItem }) => (
    <ThemedView style={styles.vocabularyItem}>
      <View style={styles.itemHeader}>
        <View style={styles.japaneseContainer}>
          <ThemedText type="title" style={styles.japaneseText}>
            {item.japanese}
          </ThemedText>
          {item.kana && (
            <ThemedText style={styles.kanaText}>{item.kana}</ThemedText>
          )}
        </View>

        <View style={styles.itemActions}>
          <TouchableOpacity
            style={styles.soundButton}
            onPress={() => speakVocabulary(item.japanese)}
            disabled={isSpeaking || !ttsAvailable}
          >
            <Ionicons
              name={isSpeaking ? "volume-high" : "volume-medium"}
              size={20}
              color={ttsAvailable ? "#007AFF" : "#999"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              setEditingItem(item);
              setShowEditModal(true);
            }}
          >
            <Ionicons name="create-outline" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteVocabulary(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.itemDetails}>
        {item.romaji && (
          <ThemedText style={styles.romajiText}>
            罗马字: {item.romaji}
          </ThemedText>
        )}

        <ThemedText style={styles.meaningText}>中文: {item.meaning}</ThemedText>

        <View style={styles.metaContainer}>
          <ThemedText style={styles.categoryText}>{item.category}</ThemedText>

          {item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <ThemedText style={styles.tagText}>{tag}</ThemedText>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.reviewInfo}>
          <ThemedText style={styles.reviewText}>
            复习次数: {item.reviewCount}
          </ThemedText>
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() => handleMarkAsReviewed(item.id)}
          >
            <ThemedText style={styles.reviewButtonText}>标记复习</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );

  // 渲染添加/编辑模态框
  const renderModal = () => {
    const isEditMode = showEditModal && editingItem;

    return (
      <Modal
        visible={showAddModal || showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
          setEditingItem(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="title">
                {isEditMode ? "编辑词汇" : "添加新词汇"}
              </ThemedText>
              <TouchableOpacity
                onPress={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setEditingItem(null);
                }}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>日文词汇 *</ThemedText>
                <TextInput
                  style={styles.textInput}
                  value={
                    isEditMode ? editingItem!.japanese : newVocabulary.japanese
                  }
                  onChangeText={(text) => {
                    if (isEditMode) {
                      setEditingItem({ ...editingItem!, japanese: text });
                    } else {
                      setNewVocabulary({ ...newVocabulary, japanese: text });
                    }
                  }}
                  placeholder="输入日文词汇"
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>假名读音</ThemedText>
                <TextInput
                  style={styles.textInput}
                  value={isEditMode ? editingItem!.kana : newVocabulary.kana}
                  onChangeText={(text) => {
                    if (isEditMode) {
                      setEditingItem({ ...editingItem!, kana: text });
                    } else {
                      setNewVocabulary({ ...newVocabulary, kana: text });
                    }
                  }}
                  placeholder="输入假名读音"
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>罗马字</ThemedText>
                <TextInput
                  style={styles.textInput}
                  value={
                    isEditMode ? editingItem!.romaji : newVocabulary.romaji
                  }
                  onChangeText={(text) => {
                    if (isEditMode) {
                      setEditingItem({ ...editingItem!, romaji: text });
                    } else {
                      setNewVocabulary({ ...newVocabulary, romaji: text });
                    }
                  }}
                  placeholder="输入罗马字"
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>中文意思 *</ThemedText>
                <TextInput
                  style={styles.textInput}
                  value={
                    isEditMode ? editingItem!.meaning : newVocabulary.meaning
                  }
                  onChangeText={(text) => {
                    if (isEditMode) {
                      setEditingItem({ ...editingItem!, meaning: text });
                    } else {
                      setNewVocabulary({ ...newVocabulary, meaning: text });
                    }
                  }}
                  placeholder="输入中文意思"
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>分类</ThemedText>
                <View style={styles.categoryButtons}>
                  {CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryButton,
                        (isEditMode
                          ? editingItem!.category
                          : newVocabulary.category) === category &&
                          styles.categoryButtonActive,
                      ]}
                      onPress={() => {
                        if (isEditMode) {
                          setEditingItem({ ...editingItem!, category });
                        } else {
                          setNewVocabulary({ ...newVocabulary, category });
                        }
                      }}
                    >
                      <ThemedText
                        style={[
                          styles.categoryButtonText,
                          (isEditMode
                            ? editingItem!.category
                            : newVocabulary.category) === category &&
                            styles.categoryButtonTextActive,
                        ]}
                      >
                        {category}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>
                  标签（用逗号分隔）
                </ThemedText>
                <TextInput
                  style={styles.textInput}
                  value={
                    isEditMode
                      ? editingItem!.tags.join(", ")
                      : newVocabulary.tags.join(", ")
                  }
                  onChangeText={(text) => {
                    const tags = text
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter((tag) => tag);
                    if (isEditMode) {
                      setEditingItem({ ...editingItem!, tags });
                    } else {
                      setNewVocabulary({ ...newVocabulary, tags });
                    }
                  }}
                  placeholder="例如：问候, 基础, 礼貌"
                />
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setEditingItem(null);
                }}
              >
                <ThemedText style={styles.cancelButtonText}>取消</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={
                  isEditMode ? handleEditVocabulary : handleAddVocabulary
                }
              >
                <ThemedText style={styles.saveButtonText}>
                  {isEditMode ? "更新" : "添加"}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>
    );
  };

  return (
    <SettingsLayout>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.container}>
          {/* 头部 */}
          <View style={styles.header}>
            <ThemedText type="title">日语词汇管理</ThemedText>
            <ThemedText style={styles.subtitle}>
              记录和复习日常遇到的日语词汇
            </ThemedText>
          </View>

          {/* 搜索和筛选 */}
          <View style={styles.filterContainer}>
            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={20}
                color="#666"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="搜索词汇、假名、罗马字或意思..."
                value={searchText}
                onChangeText={setSearchText}
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText("")}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              {allCategories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryFilterButton,
                    selectedCategory === category &&
                      styles.categoryFilterButtonActive,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <ThemedText
                    style={[
                      styles.categoryFilterText,
                      selectedCategory === category &&
                        styles.categoryFilterTextActive,
                    ]}
                  >
                    {category}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* 统计信息 */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <ThemedText type="defaultSemiBold" style={styles.statNumber}>
                {vocabularyList.length}
              </ThemedText>
              <ThemedText style={styles.statLabel}>总词汇数</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText type="defaultSemiBold" style={styles.statNumber}>
                {vocabularyList.filter((item) => item.reviewCount > 0).length}
              </ThemedText>
              <ThemedText style={styles.statLabel}>已复习</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText type="defaultSemiBold" style={styles.statNumber}>
                {CATEGORIES.length}
              </ThemedText>
              <ThemedText style={styles.statLabel}>分类</ThemedText>
            </View>
          </View>

          {/* 词汇列表 */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ThemedText>加载中...</ThemedText>
            </View>
          ) : filteredVocabulary.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={64} color="#999" />
              <ThemedText style={styles.emptyText}>
                {searchText || selectedCategory !== "全部"
                  ? "没有找到匹配的词汇"
                  : "还没有添加任何词汇"}
              </ThemedText>
            </View>
          ) : (
            <FlatList
              data={filteredVocabulary}
              renderItem={renderVocabularyItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* 添加按钮 */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color="white" />
            <ThemedText style={styles.addButtonText}>添加词汇</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>

      {/* 模态框 */}
      {renderModal()}
    </SettingsLayout>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  filterContainer: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  categoryScroll: {
    marginBottom: 8,
  },
  categoryFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    marginRight: 8,
  },
  categoryFilterButtonActive: {
    backgroundColor: "#007AFF",
  },
  categoryFilterText: {
    fontSize: 14,
    color: "#666",
  },
  categoryFilterTextActive: {
    color: "white",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    color: "#007AFF",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  listContainer: {
    paddingBottom: 100,
  },
  vocabularyItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  japaneseContainer: {
    flex: 1,
  },
  japaneseText: {
    fontSize: 28,
    color: "#333",
    marginBottom: 4,
  },
  kanaText: {
    fontSize: 16,
    color: "#666",
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  soundButton: {
    padding: 8,
    marginRight: 8,
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
  },
  itemDetails: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 12,
  },
  romajiText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  meaningText: {
    fontSize: 18,
    color: "#333",
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 14,
    color: "white",
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 1,
  },
  tag: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: "#666",
  },
  reviewInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewText: {
    fontSize: 14,
    color: "#666",
  },
  reviewButton: {
    backgroundColor: "#34C759",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  reviewButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
    textAlign: "center",
  },
  addButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalForm: {
    padding: 20,
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  categoryButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  categoryButtonActive: {
    backgroundColor: "#007AFF",
  },
  categoryButtonText: {
    fontSize: 14,
    color: "#666",
  },
  categoryButtonTextActive: {
    color: "white",
  },
  modalButtons: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    alignItems: "center",
    marginRight: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
});
