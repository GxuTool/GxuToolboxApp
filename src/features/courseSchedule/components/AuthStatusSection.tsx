import {Pressable, View} from "react-native";
import Flex from "@/components/un-ui/Flex.tsx";
import {Icon} from "@/components/un-ui/Icon.tsx";
import {Text, useTheme} from "@rneui/themed";
import {useNavigation} from "@react-navigation/native";
import {AuthState, AuthStateMap} from "@/core/auth/auth.type.ts";

interface Props {
    jwAuth: AuthState;
    unifiedAuth: AuthState;
    attendanceAuth: AuthState;
    menuItemStyle: object;
}

export function AuthStatusSection({jwAuth, unifiedAuth, attendanceAuth, menuItemStyle}: Props) {
    const navigation = useNavigation();
    const {theme} = useTheme();

    const items = [
        {label: "教务系统", icon: "school", auth: jwAuth, screen: "jwAccount"},
        {label: "统一认证", icon: "shield-account", auth: unifiedAuth, screen: "authAccount"},
        {label: "考勤系统", icon: "clock-check", auth: attendanceAuth, screen: "attendanceAccount"},
    ];

    console.log(unifiedAuth);

    return (
        <View>
            <Text style={{fontSize: 12, color: theme.colors.grey3, paddingHorizontal: 8, paddingBottom: 4}}>
                账号状态
            </Text>
            {items.map(item => (
                <Pressable
                    key={item.label}
                    style={menuItemStyle}
                    onPress={() => navigation.navigate("setting", {screen: item.screen})}>
                    <Flex align="center" gap={16} style={{flex: 1}}>
                        <Icon name={item.icon} size={22} color={theme.colors.grey2} />
                        <Text style={{flex: 1}}>{item.label}</Text>
                        <Icon
                            name={item.auth?.status === AuthStateMap.Authenticated ? "check-circle" : "alert-circle"}
                            size={20}
                            color={
                                item.auth?.status === AuthStateMap.Authenticated
                                    ? theme.colors.success
                                    : theme.colors.error
                            }
                        />
                    </Flex>
                </Pressable>
            ))}
        </View>
    );
}
