import React, {useState} from "react";
import {ScrollView, StyleSheet, TouchableOpacity, View} from "react-native";
import {Text, Divider, useTheme} from "@rneui/themed";
import {Color} from "@/shared/color.ts";

export const HolidayScreen = () => {
    const {theme} = useTheme();

    const [activeTab, setActiveTab] = useState<"national" | "local">("national");

    const nationalHolidays = [
        {name: "元旦", range: "1月1日至3日", detail: "共3天", work: "1月4日（周日）上班"},
        {name: "春节", range: "2月15日至23日", detail: "共9天", work: "2月14日（周六）、2月28日（周六）上班"},
        {name: "清明节", range: "4月4日至6日", detail: "共3天", work: "无"},
        {name: "劳动节", range: "5月1日至5日", detail: "共5天", work: "5月9日（周六）上班"},
        {name: "端午节", range: "6月19日至21日", detail: "共3天", work: "无"},
        {name: "中秋节", range: "9月25日至27日", detail: "共3天", work: "无"},
        {name: "国庆节", range: "10月1日至7日", detail: "共7天", work: "9月20日（周日）、10月10日（周六）上班"},
    ];

    const localHolidays = [{name: "三月三", range: "4月17日至20日", detail: "共4天", work: "无"}];

    const holidays = activeTab === "national" ? nationalHolidays : localHolidays;

    const styles = StyleSheet.create({
        container: {
            padding: 20,
            backgroundColor: theme.colors.background,
        },
        header: {
            marginBottom: 24,
            alignItems: "center",
        },
        title: {
            fontSize: 18,
            fontWeight: "bold",
            textAlign: "center",
            color: theme.colors.black,
            lineHeight: 26,
        },
        subTitle: {
            fontSize: 12,
            color: theme.colors.grey3,
            marginTop: 8,
        },
        card: {
            backgroundColor: theme.mode === "light" ? theme.colors.white : theme.colors.grey5,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.primary,
            elevation: 2,
            shadowColor: "#000",
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.1,
            shadowRadius: 4,
        },
        holidayHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
        },
        holidayName: {
            fontSize: 18,
            fontWeight: "bold",
            color: theme.colors.primary,
        },
        holidayDetail: {
            fontSize: 13,
            color: theme.colors.white,
            backgroundColor: theme.colors.primary,
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 4,
            overflow: "hidden",
        },
        holidayCount: {
            fontSize: 13,
        },
        holidayRange: {
            fontSize: 15,
            color: theme.colors.black,
            marginBottom: 8,
        },
        workText: {
            fontSize: 13,
            color: theme.colors.error, // 补班用红色提醒
            fontWeight: "500",
        },
        footer: {
            marginTop: 20,
            paddingBottom: 40,
        },
        footerText: {
            fontSize: 12,
            color: theme.colors.grey3,
            lineHeight: 18,
            textAlign: "justify",
        },
        tabContainer: {flexDirection: "row", marginHorizontal: 20},
        tab: {flex: 1, paddingVertical: 12, alignItems: "center"},
        activeTab: {borderBottomWidth: 2, borderBottomColor: theme.colors.primary},
    });

    return (
        <View>
            <View style={styles.tabContainer}>
                {["national", "local"].map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                        onPress={() => setActiveTab(tab as any)}>
                        <Text style={[{fontSize: 16}, activeTab === tab ? {color: theme.colors.primary, fontWeight: "bold"} : []]}>
                            {tab === "national" ? "全国节假日" : "地方节假日"}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            {activeTab === "national" ? (
                <ScrollView style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>国务院办公厅关于2026年{"\n"}部分节假日安排的通知</Text>
                        <Text style={styles.subTitle}>国办发明电〔2025〕7号</Text>
                    </View>
                    <Text style={styles.footerText}>各省、自治区、直辖市人民政府，国务院各部委、各直属机构：</Text>
                    <Text style={[styles.footerText, {marginBottom: 8}]}>
                        {" "}
                        经国务院批准，现将2026年元旦、春节、清明节、劳动节、端午节、中秋节和国庆节放假调休日期的具体安排通知如下。
                    </Text>

                    {holidays.map((item, index) => (
                        <View key={index} style={styles.card}>
                            <View style={styles.holidayHeader}>
                                <Text style={styles.holidayName}>{item.name}</Text>
                                <View style={{flexDirection: "row", alignItems: "center", gap: 4}}>
                                    <Text style={styles.holidayDetail}>{item.detail}</Text>
                                </View>
                            </View>
                            <Text style={styles.holidayRange}>{item.range}</Text>
                            {item.work !== "无" && (
                                <>
                                    <Divider style={{marginVertical: 8}} />
                                    <Text style={styles.workText}>⚠️ 调休：{item.work}</Text>
                                </>
                            )}
                        </View>
                    ))}

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            鼓励单位和个人结合落实带薪年休假等制度，实际形成较长假期，推动错峰出行。节假日期间，各地区、各部门要妥善安排好值班和安全、保卫等工作。
                        </Text>
                        <Text style={[styles.footerText, {marginTop: 16, textAlign: "right"}]}>
                            国务院办公厅{"\n"}2025年11月4日
                        </Text>
                    </View>
                </ScrollView>
            ) : (
                <ScrollView style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            广西壮族自治区人民政府办公厅关于{"\n"}2026年广西三月三放假的通知
                        </Text>
                    </View>
                    <Text style={styles.footerText}>各市、县人民政府，自治区人民政府各组成部门、各直属机构：</Text>
                    <Text style={[styles.footerText, {marginBottom: 8}]}>
                        {"       "}
                        根据《广西壮族自治区少数民族习惯节日放假办法》（广西壮族自治区人民政府令第98号）精神，经自治区人民政府同意，现将2026年广西三月三放假有关事项通知如下：
                    </Text>
                    {holidays.map((item, index) => (
                        <View key={index} style={styles.card}>
                            <View style={styles.holidayHeader}>
                                <Text style={styles.holidayName}>{item.name}</Text>
                                <View style={{flexDirection: "row", alignItems: "center", gap: 4}}>
                                    <Text style={styles.holidayDetail}>{item.detail}</Text>
                                </View>
                            </View>
                            <Text style={styles.holidayRange}>{item.range}</Text>
                            {item.work !== "无" && (
                                <>
                                    <Divider style={{marginVertical: 8}} />
                                    <Text style={styles.workText}>⚠️ 调休：{item.work}</Text>
                                </>
                            )}
                        </View>
                    ))}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            二、节假日期间，各地各部门要妥善安排好值班和安全、保卫等工作，遇有重大突发事件，要按规定妥善处置并及时报告，确保人民群众祥和平安度过节日假期。
                        </Text>
                        <Text style={[styles.footerText, {marginTop: 16, textAlign: "right"}]}>
                            广西壮族自治区人民政府办公厅{"\n"}2026年3月4日
                        </Text>
                    </View>
                </ScrollView>
            )}
        </View>
    );
};
