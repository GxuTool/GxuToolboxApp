import {SchoolTerms, SchoolTermValue, SchoolYears, SchoolYearValue} from "@/type/global.ts";
import {useUserConfig} from "@/hooks/app.ts";
import {Pressable, ScrollView, StyleSheet, View} from "react-native";
import {Flex, Icon, UnText, UnTooltip, vh, vw} from "@/components/un-ui/index.ts";
import {Divider, useTheme} from "@rneui/themed";
import {Color} from "@/shared/color.ts";
import {useEffect, useState} from "react";

export interface UnTermSelectorProps {
    year?: SchoolYearValue | number;
    term?: SchoolTermValue;
    thirdTerm?: boolean;
    disableSelectAll?: boolean;
    onChange?: (year: SchoolYearValue | number, term: SchoolTermValue) => void;
}

export function UnTermSelector(props: UnTermSelectorProps) {
    const {userConfig} = useUserConfig();
    const {theme} = useTheme();

    const [selectedYear, setSelectedYear] = useState<SchoolYearValue>(props.year);
    const [selectedTerm, setSelectedTerm] = useState<SchoolTermValue>(props.term);
    const [selectedAll, setSelectedAll] = useState(false);

    useEffect(() => {
        if (selectedYear || selectedTerm) setSelectedAll(false);
        props.onChange?.(selectedYear, selectedTerm);
    }, [selectedYear, selectedTerm]);

    const style = StyleSheet.create({
        labelContainer: {
            height: 42,
            paddingHorizontal: 16,
        },
        option: {
            borderRadius: 8,
            padding: 8,
        },
        selectedOption: {
            backgroundColor: Color.mix(theme.colors.primary, theme.colors.grey3, 0.7).rgbaString,
            borderRadius: 8,
            padding: 8,
        },
    });
    console.log(props);

    return (
        <UnTooltip
            popover={
                <View style={{paddingHorizontal: 16}}>
                    {!props.disableSelectAll && (
                        <>
                            <Pressable
                                android_ripple={userConfig.theme.ripple}
                                onPress={() => {
                                    setSelectedAll(true);
                                    setSelectedTerm(undefined);
                                    setSelectedYear(undefined);
                                }}
                                style={selectedAll ? style.selectedOption : style.option}>
                                <UnText>全部学期</UnText>
                            </Pressable>
                            <Divider />
                        </>
                    )}
                    <Flex align="flex-start" gap={4}>
                        <ScrollView style={{width: vw(40) - 24}} contentContainerStyle={{gap: 4}}>
                            {SchoolYears.map(year => (
                                <Pressable
                                    onPress={() => setSelectedYear(+year[0])}
                                    key={year[1]}
                                    style={+year[0] === +selectedYear ? style.selectedOption : style.option}
                                    android_ripple={userConfig.theme.ripple}>
                                    <UnText>{year[1]}学年</UnText>
                                </Pressable>
                            ))}
                        </ScrollView>
                        <Divider orientation="vertical" />
                        <ScrollView style={{width: vw(40)}} contentContainerStyle={{gap: 4}}>
                            {SchoolTerms.filter((_, i) => (props.thirdTerm && i == 2) || i !== 2).map(term => (
                                <Pressable
                                    onPress={() => setSelectedTerm(term[0])}
                                    key={term[1]}
                                    android_ripple={userConfig.theme.ripple}
                                    style={term[0] === selectedTerm ? style.selectedOption : style.option}>
                                    <UnText>{term[1]}</UnText>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </Flex>
                </View>
            }
            height={vh(30)}
            width={vw(80)}
            skipAndroidStatusBar>
            <Flex style={style.labelContainer} inline justify="flex-end" gap={4}>
                <Icon name="calendar" size={18} />
                {selectedAll ? (
                    <UnText>全部学期</UnText>
                ) : (
                    <UnText>
                        {`${selectedYear}-${+selectedYear + 1}学年`}
                        {SchoolTerms.find(term => term[0] === selectedTerm)?.[1]}
                    </UnText>
                )}
            </Flex>
        </UnTooltip>
    );
}
