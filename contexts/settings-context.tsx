import React, { createContext, useContext, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 全局设置类型
export type LearningMode = "sequential" | "random";
export type KanaType = "hiragana" | "katakana" | "mixed";

export interface GlobalSettings {
  // 学习模式：顺序或随机
  learningMode: LearningMode;
  // 假名类型：平假名、片假名或混合
  defaultKanaType: KanaType;
  // 是否显示罗马音提示
  showRomajiHint: boolean;
  // 是否自动播放发音
  autoPlayPronunciation: boolean;
  // 测验题目数量
  quizQuestionCount: number;
}

export interface LearningStats {
  // 总学习次数
  totalSessions: number;
  // 总正确次数
  totalCorrect: number;
  // 总尝试次数
  totalAttempts: number;
  // 每个假名的学习记录
  kanaRecords: Record<
    string,
    {
      attempts: number;
      correct: number;
      lastAnswered: string | null;
    }
  >;
  // 最后重置时间
  lastResetTime: string | null;
}

interface SettingsContextType {
  settings: GlobalSettings;
  stats: LearningStats;
  updateSettings: (newSettings: Partial<GlobalSettings>) => Promise<void>;
  resetStats: () => Promise<void>;
  toggleLearningMode: () => Promise<void>;
  toggleKanaType: () => Promise<void>;
  updateKanaRecord: (kanaId: string, isCorrect: boolean) => Promise<void>;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

// 默认设置
const defaultSettings: GlobalSettings = {
  learningMode: "sequential",
  defaultKanaType: "mixed",
  showRomajiHint: true,
  autoPlayPronunciation: false,
  quizQuestionCount: 10,
};

// 默认统计
const defaultStats: LearningStats = {
  totalSessions: 0,
  totalCorrect: 0,
  totalAttempts: 0,
  kanaRecords: {},
  lastResetTime: null,
};

// 创建上下文
const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

// 存储键
const SETTINGS_STORAGE_KEY = "@japanese_kana_learn_settings";
const STATS_STORAGE_KEY = "@japanese_kana_learn_stats";

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
}) => {
  const [settings, setSettings] = useState<GlobalSettings>(defaultSettings);
  const [stats, setStats] = useState<LearningStats>(defaultStats);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 加载保存的设置和统计
  React.useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      // 加载设置
      const savedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }

      // 加载统计
      const savedStats = await AsyncStorage.getItem(STATS_STORAGE_KEY);
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    } catch (error) {
      console.error("Failed to load saved data:", error);
    }
  };

  const saveSettings = async (newSettings: GlobalSettings) => {
    try {
      await AsyncStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(newSettings),
      );
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const saveStats = async (newStats: LearningStats) => {
    try {
      await AsyncStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(newStats));
    } catch (error) {
      console.error("Failed to save stats:", error);
    }
  };

  const updateSettings = async (newSettings: Partial<GlobalSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    await saveSettings(updatedSettings);
  };

  const resetStats = async () => {
    const resetTime = new Date().toISOString();
    const newStats: LearningStats = {
      ...defaultStats,
      lastResetTime: resetTime,
    };
    setStats(newStats);
    await saveStats(newStats);
  };

  const toggleLearningMode = async () => {
    const newMode: LearningMode =
      settings.learningMode === "sequential" ? "random" : "sequential";
    await updateSettings({ learningMode: newMode });
  };

  const toggleKanaType = async () => {
    const currentType = settings.defaultKanaType;
    let newType: KanaType;

    if (currentType === "hiragana") {
      newType = "katakana";
    } else if (currentType === "katakana") {
      newType = "mixed";
    } else {
      newType = "hiragana";
    }

    await updateSettings({ defaultKanaType: newType });
  };

  const updateKanaRecord = async (kanaId: string, isCorrect: boolean) => {
    const currentRecord = stats.kanaRecords[kanaId] || {
      attempts: 0,
      correct: 0,
      lastAnswered: null,
    };
    const now = new Date().toISOString();

    const updatedRecord = {
      attempts: currentRecord.attempts + 1,
      correct: currentRecord.correct + (isCorrect ? 1 : 0),
      lastAnswered: now,
    };

    const newStats: LearningStats = {
      ...stats,
      totalSessions: stats.totalSessions + 1,
      totalAttempts: stats.totalAttempts + 1,
      totalCorrect: stats.totalCorrect + (isCorrect ? 1 : 0),
      kanaRecords: {
        ...stats.kanaRecords,
        [kanaId]: updatedRecord,
      },
    };

    setStats(newStats);
    await saveStats(newStats);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const contextValue: SettingsContextType = {
    settings,
    stats,
    updateSettings,
    resetStats,
    toggleLearningMode,
    toggleKanaType,
    updateKanaRecord,
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

// 自定义hook
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
