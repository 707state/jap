import { Image } from "expo-image";
import { Platform, StyleSheet, View } from "react-native";

import { HelloWave } from "@/components/hello-wave";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { CardContainer } from "@/components/card-container";
import { Link } from "expo-router";
import { TouchableOpacity } from "react-native";
import { SettingsLayout } from "@/components/settings-layout";

export default function HomeScreen() {
  return (
    <SettingsLayout>
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        headerImage={
          <Image
            source={require("@/assets/images/kata.png")}
            style={styles.reactLogo}
          />
        }
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">日语50音学习</ThemedText>
          <HelloWave />
        </ThemedView>

        {/* 学习入口卡片 */}
        <ThemedView style={styles.learningCard}>
          <ThemedText type="subtitle" style={styles.cardTitle}>
            开始学习
          </ThemedText>
          <ThemedText style={styles.cardDescription}>
            点击下方按钮开始学习日语50音，包含平假名和片假名。
          </ThemedText>

          <Link href="/learn" asChild>
            <TouchableOpacity style={styles.startButton}>
              <ThemedText style={styles.startButtonText}>开始学习</ThemedText>
            </TouchableOpacity>
          </Link>
        </ThemedView>

        {/* 功能说明 */}
        <CardContainer title="学习功能">
          <ThemedText>
            • <ThemedText type="defaultSemiBold">平假名学习</ThemedText>
            ：学习あ、い、う、え、お等平假名
          </ThemedText>
          <ThemedText>
            • <ThemedText type="defaultSemiBold">片假名学习</ThemedText>
            ：学习ア、イ、ウ、エ、オ等片假名
          </ThemedText>
          <ThemedText>
            • <ThemedText type="defaultSemiBold">混合练习</ThemedText>
            ：随机显示平假名或片假名
          </ThemedText>
          <ThemedText>
            • <ThemedText type="defaultSemiBold">进度跟踪</ThemedText>
            ：记录学习进度
          </ThemedText>
          <ThemedText>
            • <ThemedText type="defaultSemiBold">假名表</ThemedText>
            ：查看完整的50音图表
          </ThemedText>
          <ThemedText>
            • <ThemedText type="defaultSemiBold">发音练习</ThemedText>
            ：学习正确发音
          </ThemedText>
          <ThemedText>
            • <ThemedText type="defaultSemiBold">知识测验</ThemedText>
            ：测试学习成果
          </ThemedText>
          <ThemedText>
            • <ThemedText type="defaultSemiBold">输入学习</ThemedText>
            ：输入读音进行测试，错误自动复习
          </ThemedText>
        </CardContainer>

        {/* 数据统计 */}
        <CardContainer title="数据统计">
          <ThemedText>
            当前包含 <ThemedText type="defaultSemiBold">46个</ThemedText> 假名
          </ThemedText>
          <ThemedText>
            包含：<ThemedText type="defaultSemiBold">5个元音</ThemedText> +{" "}
            <ThemedText type="defaultSemiBold">41个辅音</ThemedText>
          </ThemedText>
        </CardContainer>

        {/* 快速入口 */}
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle" darkColor="black">
            快速入口
          </ThemedText>
          <View style={styles.quickLinks}>
            <View style={styles.quickLinksRow}>
              <Link href="/learn" asChild>
                <TouchableOpacity
                  style={[styles.quickLinkButton, styles.primaryButton]}
                >
                  <ThemedText
                    style={[styles.quickLinkText, styles.primaryText]}
                  >
                    开始学习
                  </ThemedText>
                </TouchableOpacity>
              </Link>
              <Link href="/kana-list" asChild>
                <TouchableOpacity
                  style={[styles.quickLinkButton, styles.secondaryButton]}
                >
                  <ThemedText
                    style={[styles.quickLinkText, styles.secondaryText]}
                  >
                    假名表
                  </ThemedText>
                </TouchableOpacity>
              </Link>
            </View>
            <View style={styles.quickLinksRow}>
              <Link href="/quiz" asChild>
                <TouchableOpacity
                  style={[styles.quickLinkButton, styles.tertiaryButton]}
                >
                  <ThemedText
                    style={[styles.quickLinkText, styles.tertiaryText]}
                  >
                    测验
                  </ThemedText>
                </TouchableOpacity>
              </Link>
              <Link href="/input-learn" asChild>
                <TouchableOpacity
                  style={[styles.quickLinkButton, styles.quaternaryButton]}
                >
                  <ThemedText
                    style={[styles.quickLinkText, styles.quaternaryText]}
                  >
                    输入学习
                  </ThemedText>
                </TouchableOpacity>
              </Link>
            </View>
            <View style={styles.quickLinksRow}>
              <Link href="/vocabulary" asChild>
                <TouchableOpacity
                  style={[styles.quickLinkButton, styles.quinaryButton]}
                >
                  <ThemedText
                    style={[styles.quickLinkText, styles.quinaryText]}
                  >
                    词汇管理
                  </ThemedText>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ThemedView>

        <CardContainer title="开发说明">
          <ThemedText>
            编辑{" "}
            <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText>{" "}
            查看变化。 按{" "}
            <ThemedText type="defaultSemiBold">
              {Platform.select({
                ios: "cmd + d",
                android: "cmd + m",
                web: "F12",
              })}
            </ThemedText>{" "}
            打开开发者工具。
          </ThemedText>
        </CardContainer>
      </ParallaxScrollView>
    </SettingsLayout>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  learningCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  cardTitle: {
    marginBottom: 8,
    color: "#212529",
  },
  cardDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: "#495057",
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: "#007AFF",
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 30,
    alignItems: "center",
  },
  startButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },

  quickLinks: {
    marginTop: 10,
    gap: 12,
  },
  quickLinksRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  quickLinkButton: {
    flex: 1,
    backgroundColor: "#FFFFFF", // 白色背景
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 2,
  },
  primaryButton: {
    backgroundColor: "#FFFFFF", // 白色背景
    borderColor: "#4A6FA5", // 深蓝色边框
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF", // 白色背景
    borderColor: "#6B8E23", // 橄榄绿边框
  },
  tertiaryButton: {
    backgroundColor: "#FFFFFF", // 白色背景
    borderColor: "#D2691E", // 巧克力色边框
  },
  quaternaryButton: {
    backgroundColor: "#FFFFFF", // 白色背景
    borderColor: "#9370DB", // 中紫色边框
  },
  quinaryButton: {
    backgroundColor: "#FFFFFF", // 白色背景
    borderColor: "#20B2AA", // 浅海洋绿边框
  },
  quickLinkText: {
    fontSize: 16,
    fontWeight: "600",
  },
  primaryText: {
    color: "#4A6FA5", // 深蓝色文字
  },
  secondaryText: {
    color: "#6B8E23", // 橄榄绿文字
  },
  tertiaryText: {
    color: "#D2691E", // 巧克力色文字
  },
  quaternaryText: {
    color: "#9370DB", // 中紫色文字
  },
  quinaryText: {
    color: "#20B2AA", // 浅海洋绿文字
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  stepContainer: {
    gap: 12,
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
  },
});
