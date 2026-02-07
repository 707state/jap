import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { useSettings, LearningMode, KanaType } from '@/contexts/settings-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.8;
const MAX_SIDEBAR_WIDTH = 320;

interface SettingsSidebarProps {
  onClose?: () => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ onClose }) => {
  const {
    settings,
    stats,
    toggleLearningMode,
    toggleKanaType,
    resetStats,
    updateSettings,
    isSidebarOpen,
    closeSidebar,
  } = useSettings();

  const sidebarWidth = Math.min(SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH);
  const translateX = React.useRef(new Animated.Value(-sidebarWidth)).current;

  React.useEffect(() => {
    Animated.timing(translateX, {
      toValue: isSidebarOpen ? 0 : -sidebarWidth,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isSidebarOpen, sidebarWidth]);

  const handleClose = () => {
    closeSidebar();
    onClose?.();
  };

  // 获取学习模式显示文本
  const getLearningModeText = (mode: LearningMode) => {
    return mode === 'sequential' ? '顺序模式' : '随机模式';
  };

  // 获取假名类型显示文本
  const getKanaTypeText = (type: KanaType) => {
    switch (type) {
      case 'hiragana':
        return '平假名';
      case 'katakana':
        return '片假名';
      case 'mixed':
        return '混合模式';
      default:
        return '混合模式';
    }
  };

  // 计算准确率
  const calculateAccuracy = () => {
    if (stats.totalAttempts === 0) return 0;
    return Math.round((stats.totalCorrect / stats.totalAttempts) * 100);
  };

  // 获取重置时间显示
  const getResetTimeDisplay = () => {
    if (!stats.lastResetTime) return '从未重置';

    const resetDate = new Date(stats.lastResetTime);
    const now = new Date();
    const diffMs = now.getTime() - resetDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '昨天';
    } else {
      return `${diffDays}天前`;
    }
  };

  if (!isSidebarOpen) return null;

  return (
    <>
      {/* 遮罩层 */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleClose}
      />

      {/* 侧边栏 */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            width: sidebarWidth,
            transform: [{ translateX }],
          },
        ]}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* 头部 */}
            <View style={styles.header}>
              <View style={styles.headerTitle}>
                <Ionicons name="settings-outline" size={24} color="#007AFF" />
                <ThemedText type="title" style={styles.title}>
                  全局设置
                </ThemedText>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* 学习模式设置 */}
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                学习模式
              </ThemedText>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <ThemedText style={styles.settingLabel}>当前模式</ThemedText>
                  <ThemedText style={styles.settingValue}>
                    {getLearningModeText(settings.learningMode)}
                  </ThemedText>
                </View>
                <TouchableOpacity
                  style={styles.toggleButton}
                  onPress={toggleLearningMode}
                >
                  <ThemedText style={styles.toggleButtonText}>
                    切换模式
                  </ThemedText>
                </TouchableOpacity>
              </View>

              <ThemedText style={styles.settingDescription}>
                {settings.learningMode === 'sequential'
                  ? '顺序模式：按照假名表的顺序进行学习'
                  : '随机模式：随机显示假名进行学习'}
              </ThemedText>
            </View>

            {/* 假名类型设置 */}
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                假名类型
              </ThemedText>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <ThemedText style={styles.settingLabel}>当前类型</ThemedText>
                  <ThemedText style={styles.settingValue}>
                    {getKanaTypeText(settings.defaultKanaType)}
                  </ThemedText>
                </View>
                <TouchableOpacity
                  style={styles.toggleButton}
                  onPress={toggleKanaType}
                >
                  <ThemedText style={styles.toggleButtonText}>
                    切换类型
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* 其他设置 */}
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                其他设置
              </ThemedText>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <ThemedText style={styles.settingLabel}>罗马音提示</ThemedText>
                  <ThemedText style={styles.settingValue}>
                    {settings.showRomajiHint ? '开启' : '关闭'}
                  </ThemedText>
                </View>
                <TouchableOpacity
                  style={styles.toggleButton}
                  onPress={() => updateSettings({ showRomajiHint: !settings.showRomajiHint })}
                >
                  <ThemedText style={styles.toggleButtonText}>
                    {settings.showRomajiHint ? '关闭' : '开启'}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <ThemedText style={styles.settingLabel}>自动发音</ThemedText>
                  <ThemedText style={styles.settingValue}>
                    {settings.autoPlayPronunciation ? '开启' : '关闭'}
                  </ThemedText>
                </View>
                <TouchableOpacity
                  style={styles.toggleButton}
                  onPress={() => updateSettings({ autoPlayPronunciation: !settings.autoPlayPronunciation })}
                >
                  <ThemedText style={styles.toggleButtonText}>
                    {settings.autoPlayPronunciation ? '关闭' : '开启'}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <ThemedText style={styles.settingLabel}>测验题目数</ThemedText>
                  <ThemedText style={styles.settingValue}>
                    {settings.quizQuestionCount} 题
                  </ThemedText>
                </View>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => {
                      if (settings.quizQuestionCount > 5) {
                        updateSettings({ quizQuestionCount: settings.quizQuestionCount - 5 });
                      }
                    }}
                  >
                    <ThemedText style={styles.quantityButtonText}>-</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => {
                      if (settings.quizQuestionCount < 50) {
                        updateSettings({ quizQuestionCount: settings.quizQuestionCount + 5 });
                      }
                    }}
                  >
                    <ThemedText style={styles.quantityButtonText}>+</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* 学习统计 */}
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                学习统计
              </ThemedText>

              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <ThemedText style={styles.statValue}>{stats.totalSessions}</ThemedText>
                  <ThemedText style={styles.statLabel}>学习次数</ThemedText>
                </View>

                <View style={styles.statItem}>
                  <ThemedText style={styles.statValue}>{stats.totalAttempts}</ThemedText>
                  <ThemedText style={styles.statLabel}>总尝试</ThemedText>
                </View>

                <View style={styles.statItem}>
                  <ThemedText style={styles.statValue}>{stats.totalCorrect}</ThemedText>
                  <ThemedText style={styles.statLabel}>正确次数</ThemedText>
                </View>

                <View style={styles.statItem}>
                  <ThemedText style={styles.statValue}>{calculateAccuracy()}%</ThemedText>
                  <ThemedText style={styles.statLabel}>准确率</ThemedText>
                </View>
              </View>

              <ThemedText style={styles.resetInfo}>
                上次重置：{getResetTimeDisplay()}
              </ThemedText>
            </View>

            {/* 重置按钮 */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetStats}
              >
                <Ionicons name="refresh-outline" size={20} color="#FF3B30" />
                <ThemedText style={styles.resetButtonText}>
                  重置所有学习记录
                </ThemedText>
              </TouchableOpacity>

              <ThemedText style={styles.resetWarning}>
                注意：重置后将清除所有学习统计，无法恢复
              </ThemedText>
            </View>

            {/* 版本信息 */}
            <View style={styles.footer}>
              <ThemedText style={styles.versionText}>
                日语50音学习 v1.0.0
              </ThemedText>
              <ThemedText style={styles.copyrightText}>
                © 2024 日语学习应用
              </ThemedText>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
  },
  closeButton: {
    padding: 4,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    marginBottom: 16,
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  settingDescription: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
    marginTop: 8,
  },
  toggleButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 36,
    height: 36,
    backgroundColor: '#f0f0f0',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  resetInfo: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 8,
  },
  resetButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  resetWarning: {
    fontSize: 12,
    color: '#FF3B30',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: '#999',
  },
});
