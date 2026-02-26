import {ScrollView, StyleSheet, TextStyle, ViewStyle} from "react-native";
import {Color} from "@/shared/color.ts";
import {useTheme} from "@rneui/themed";
import React from "react";
import {Cell, Row, Table, TableWrapper} from "react-native-reanimated-table";
import {UnText} from "@/components/un-ui/UnText.tsx";

export interface UnTableProps<T = any> {
    cols: UnTableCols<T>;
    rowHeight?: number;
    headerHeight?: number;
    data: T[];
    style?: ViewStyle;
    borderStyle?: {
        borderColor?: string;
        borderWidth?: number;
    };
    noDataText?: React.ReactNode;
    hideHeader?: boolean;
}

export interface UnTableCol<T> {
    dataIndex: keyof T;
    key: any;
    default: React.ReactNode;
    render: (value: any, record: T, index: number) => React.ReactNode;

    width: number;
    flex: number;

    title: React.ReactNode;
    headerStyle: ViewStyle;
    headerTextStyle: TextStyle;

    cellStyle: ViewStyle;
    cellTextStyle: TextStyle;
}
export type UnTableCols<T = any> = Partial<UnTableCol<T>>[];

export function UnTable<T = any>(props: UnTableProps<T>) {
    const {theme} = useTheme();
    const style = StyleSheet.create({
        tableText: {
            color: theme.colors.black,
            textAlign: "center",
            margin: 5,
        },
        tableCell: {
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.grey2,
        },
        table: {
            borderRadius: 16,
            paddingBottom: 16,
            overflow: "hidden",
        },
        tableHeader: {
            backgroundColor: Color.mix(
                Color(theme.colors.primary),
                Color(theme.colors.background),
                theme.mode === "dark" ? 0.5 : 0.2,
            ).setAlpha(theme.mode === "dark" ? 0.4 : 0.6).rgbaString,
        },
        noData: {
            padding: 8,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.grey2,
        },
    });

    return (
        <ScrollView horizontal>
            <Table borderStyle={props.borderStyle} style={[style.table, props.style]}>
                {!props.hideHeader && (
                    <Row
                        data={props.cols.map(col => (
                            <Cell
                                data={[col.title ?? ""]}
                                width={col.width}
                                flex={col.flex}
                                textStyle={[style.tableText, col.headerTextStyle]}
                                style={[style.tableHeader, col.headerStyle]}
                                height={props.headerHeight ?? 50}
                            />
                        ))}
                    />
                )}
                {props.data.map((record, i) => (
                    <Row
                        data={props.cols.map(col => (
                            <Cell
                                width={col.width}
                                heightArr={new Array(props.data.length).fill(props.rowHeight ?? 50)}
                                flex={col.flex}
                                height={props.rowHeight ?? 50}
                                textStyle={[style.tableText, col.cellTextStyle]}
                                style={[style.tableCell, col.cellStyle]}
                                data={
                                    (col.dataIndex !== undefined
                                        ? (col.render?.(record[col.dataIndex], record, i) ??
                                          record[col.dataIndex] ??
                                          col.default)
                                        : (col.render?.(undefined, record, i) ?? col.default)) as React.ReactNode
                                }
                            />
                        ))}
                    />
                ))}

                {props.data.length === 0 && (
                    <TableWrapper style={style.noData}>
                        {!props.noDataText || typeof props.noDataText === "string" ? (
                            <UnText style={{textAlign: "center"}}>{props.noDataText ?? "暂无数据"}</UnText>
                        ) : (
                            props.noDataText
                        )}
                    </TableWrapper>
                )}
            </Table>
        </ScrollView>
    );
}
