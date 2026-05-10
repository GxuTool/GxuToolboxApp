import {Modal, Platform, ScrollView, StatusBar, StyleSheet, Switch, TextInput, View, ViewProps} from "react-native";
import {useTheme} from "@rneui/themed";
import React, {useCallback, useMemo, useState} from "react";
import Clipboard from "@react-native-clipboard/clipboard";
import Flex from "./Flex";
import {Icon} from "./Icon";
import {NumberInput} from "./NumberInput";
import {UnText} from "./UnText";
import {Color} from "@/shared/color";
import {UnPressable} from "./UnPressable";
import {SafeAreaView} from "react-native-safe-area-context";

// ─── Types ───────────────────────────────────────────────

export interface UnJsonEditorProps extends ViewProps {
    value: unknown;
    onChange?: (value: unknown) => void;
    editable?: boolean;
    defaultEditable?: boolean;
    onEditableChange?: (editable: boolean) => void;
    maxHeight?: number;
    readOnly?: boolean;
    showCopy?: boolean;
}

export interface UnJsonEditorModalProps extends Omit<UnJsonEditorProps, "style"> {
    visible: boolean;
    onClose: () => void;
    title?: string;
    animationType?: "none" | "slide" | "fade";
}

// ─── Line types ───────────────────────────────────────────

const LINE_KIND_PRIMITIVE = 0;
const LINE_KIND_COLLAPSIBLE = 1;

type JsonLine = {
    key: string;
    value: unknown;
    depth: number;
    path: (string | number)[];
    kind: number;
    collapsibleType?: "object" | "array";
    childCount?: number;
};

// ─── Constants ────────────────────────────────────────────

const TYPE_COLORS = {
    string: "#4caf50",
    number: "#42a5f5",
    boolean: "#ab47bc",
    null: "#9e9e9e",
};

const MONO_FONT = Platform.select({ios: "Menlo", android: "monospace"});

const AUTO_EXPAND_DEPTH = 2;

// ─── Utilities ────────────────────────────────────────────

function pathKey(path: (string | number)[]): string {
    return path.join(".");
}

function setByPath(obj: unknown, path: (string | number)[], value: unknown): unknown {
    if (path.length === 0) return value;
    const head = path[0];
    const rest = path.slice(1);
    if (Array.isArray(obj)) {
        const arrCopy = obj.slice();
        arrCopy[head as number] = setByPath(arrCopy[head as number], rest, value);
        return arrCopy;
    }
    if (obj && typeof obj === "object") {
        const record = obj as Record<string, unknown>;
        const objCopy: Record<string, unknown> = {};
        const keys = Object.keys(record);
        for (let i = 0; i < keys.length; i++) {
            objCopy[keys[i]] = record[keys[i]];
        }
        objCopy[head as string] = setByPath(objCopy[head as string], rest, value);
        return objCopy;
    }
    return obj;
}

function getByPath(obj: unknown, path: (string | number)[]): unknown {
    if (path.length === 0) return obj;
    let current = obj;
    for (let i = 0; i < path.length; i++) {
        if (current === null || current === undefined) return undefined;
        if (Array.isArray(current)) {
            current = (current as unknown[])[path[i] as number];
        } else if (typeof current === "object") {
            current = (current as Record<string, unknown>)[path[i] as string];
        } else {
            return undefined;
        }
    }
    return current;
}

// ─── Flatten JSON tree into lines ─────────────────────────

function flattenJson(value: unknown, key: string, path: (string | number)[], depth: number, result: JsonLine[]): void {
    // Primitive values
    if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        result.push({
            key: key,
            value: value,
            depth: depth,
            path: path,
            kind: LINE_KIND_PRIMITIVE,
        });
        return;
    }

    // Array
    if (Array.isArray(value)) {
        const arr = value as unknown[];
        result.push({
            key: key,
            value: value,
            depth: depth,
            path: path,
            kind: LINE_KIND_COLLAPSIBLE,
            collapsibleType: "array",
            childCount: arr.length,
        });
        for (let i = 0; i < arr.length; i++) {
            flattenJson(arr[i], "[" + i + "]", path.concat([i]), depth + 1, result);
        }
        return;
    }

    // Object
    if (value && typeof value === "object") {
        const obj = value as Record<string, unknown>;
        const keys = Object.keys(obj);
        result.push({
            key: key,
            value: value,
            depth: depth,
            path: path,
            kind: LINE_KIND_COLLAPSIBLE,
            collapsibleType: "object",
            childCount: keys.length,
        });
        for (let j = 0; j < keys.length; j++) {
            const k = keys[j];
            flattenJson(obj[k], k, path.concat([k]), depth + 1, result);
        }
        return;
    }

    // Fallback
    result.push({
        key: key,
        value: value,
        depth: depth,
        path: path,
        kind: LINE_KIND_PRIMITIVE,
    });
}

// ─── Filter visible lines ─────────────────────────────────

function computeVisibleLines(
    allLines: JsonLine[],
    collapsedState: Record<string, boolean>,
    autoExpandDepth: number,
): JsonLine[] {
    const result: JsonLine[] = [];
    const collapsedStack: number[] = [];

    for (let i = 0; i < allLines.length; i++) {
        const line = allLines[i];

        // Pop collapsed stack when depth moves out of collapsed region
        while (collapsedStack.length > 0 && line.depth <= collapsedStack[collapsedStack.length - 1]) {
            collapsedStack.pop();
        }

        // Skip if inside a collapsed region
        if (collapsedStack.length > 0) {
            continue;
        }

        // Check if this collapsible line is collapsed
        if (line.kind === LINE_KIND_COLLAPSIBLE) {
            const pk = pathKey(line.path);
            // Collapsed if: manually collapsed, OR beyond autoExpandDepth and never expanded
            if (collapsedState[pk] !== undefined) {
                // User has explicitly toggled this path
                if (collapsedState[pk]) {
                    result.push(line);
                    collapsedStack.push(line.depth);
                    continue;
                }
                // explicitly expanded — fall through to push
            } else if (line.depth >= autoExpandDepth) {
                // Beyond auto-expand and never toggled → collapsed by default
                result.push(line);
                collapsedStack.push(line.depth);
                continue;
            }
        }

        result.push(line);
    }

    return result;
}

// ─── PrimitiveLine ────────────────────────────────────────

type PrimitiveLineProps = {
    line: JsonLine;
    editable: boolean;
    editingKey: boolean;
    onStartEditKey: (pathKey: string) => void;
    onFinishEditKey: (path: (string | number)[], oldKey: string, newKey: string) => void;
    onValueChange: (path: (string | number)[], newValue: unknown) => void;
    onDelete: (path: (string | number)[]) => void;
    theme: ReturnType<typeof useTheme>["theme"];
};

function PrimitiveLine(props: PrimitiveLineProps) {
    const line = props.line;
    const theme = props.theme;
    const value = line.value;
    const dimColor = Color(theme.colors.black).setAlpha(0.5).rgbaString;

    const nullEditingState = useState(false);
    const nullEditing = nullEditingState[0];
    const setNullEditing = nullEditingState[1];

    const keyEditValueState = useState(line.key);
    const keyEditValue = keyEditValueState[0];
    const setKeyEditValue = keyEditValueState[1];

    const styles = useMemo(
        function () {
            return StyleSheet.create({
                row: {
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    paddingVertical: 4,
                    paddingRight: 4,
                },
                indentSpacer: {},
                keyText: {
                    fontFamily: MONO_FONT,
                    fontSize: 13,
                    fontWeight: "600",
                    color: theme.colors.black,
                },
                keyInput: {
                    fontFamily: MONO_FONT,
                    fontSize: 13,
                    color: theme.colors.black,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.grey4,
                    paddingVertical: 0,
                    paddingHorizontal: 2,
                    minWidth: 40,
                    maxWidth: 120,
                },
                colon: {
                    fontFamily: MONO_FONT,
                    fontSize: 13,
                    color: dimColor,
                },
                valueString: {fontFamily: MONO_FONT, fontSize: 13, color: TYPE_COLORS.string},
                valueNumber: {fontFamily: MONO_FONT, fontSize: 13, color: TYPE_COLORS.number},
                valueBoolean: {fontFamily: MONO_FONT, fontSize: 13, color: TYPE_COLORS.boolean},
                valueNull: {
                    fontFamily: MONO_FONT,
                    fontSize: 13,
                    color: TYPE_COLORS.null,
                    fontStyle: "italic",
                },
                stringInput: {
                    fontFamily: MONO_FONT,
                    fontSize: 13,
                    color: TYPE_COLORS.string,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.grey4,
                    paddingVertical: 0,
                    paddingHorizontal: 2,
                    minWidth: 60,
                    flex: 1,
                },
                nullPressable: {
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: theme.colors.grey4,
                    borderStyle: "dashed",
                },
                deleteBtn: {
                    padding: 2,
                    marginLeft: 4,
                },
            });
        },
        [theme, dimColor],
    );

    const handleKeySubmit = function () {
        const newKey = keyEditValue.trim();
        if (newKey && newKey !== line.key) {
            props.onFinishEditKey(line.path, line.key, newKey);
        }
        setKeyEditValue(line.key);
    };

    const renderKey = function () {
        if (props.editable && props.editingKey) {
            return (
                <TextInput
                    style={styles.keyInput}
                    value={keyEditValue}
                    onChangeText={function (v) {
                        return setKeyEditValue(v);
                    }}
                    onSubmitEditing={handleKeySubmit}
                    onBlur={handleKeySubmit}
                    autoFocus
                    autoCapitalize="none"
                    autoCorrect={false}
                />
            );
        }
        if (props.editable) {
            return (
                <UnPressable
                    onPress={function () {
                        setKeyEditValue(line.key);
                        props.onStartEditKey(pathKey(line.path));
                    }}
                    android_ripple={{color: theme.colors.grey4}}>
                    <UnText style={styles.keyText}>{line.key}</UnText>
                </UnPressable>
            );
        }
        return <UnText style={styles.keyText}>{line.key}</UnText>;
    };

    const renderValue = function () {
        // ── Null ──
        if (value === null) {
            if (props.editable) {
                if (nullEditing) {
                    return (
                        <TextInput
                            style={styles.stringInput}
                            value=""
                            placeholder="null"
                            placeholderTextColor={dimColor}
                            onChangeText={function (v) {
                                props.onValueChange(line.path, v);
                                setNullEditing(false);
                            }}
                            onBlur={function () {
                                return setNullEditing(false);
                            }}
                            autoFocus
                        />
                    );
                }
                return (
                    <UnPressable
                        style={styles.nullPressable}
                        onPress={function () {
                            return setNullEditing(true);
                        }}
                        android_ripple={{color: theme.colors.grey4}}>
                        <UnText style={styles.valueNull}>null</UnText>
                    </UnPressable>
                );
            }
            return <UnText style={styles.valueNull}>null</UnText>;
        }

        // ── Boolean ──
        if (typeof value === "boolean") {
            if (props.editable) {
                return (
                    <Switch
                        value={value}
                        onValueChange={function (v) {
                            return props.onValueChange(line.path, v);
                        }}
                        trackColor={{false: theme.colors.grey4, true: TYPE_COLORS.boolean}}
                    />
                );
            }
            return <UnText style={styles.valueBoolean}>{value ? "true" : "false"}</UnText>;
        }

        // ── Number ──
        if (typeof value === "number") {
            if (props.editable) {
                return (
                    <NumberInput
                        value={value}
                        onChange={function (v) {
                            if (!isNaN(v)) props.onValueChange(line.path, v);
                        }}
                    />
                );
            }
            return <UnText style={styles.valueNumber}>{String(value)}</UnText>;
        }

        // ── String ──
        if (typeof value === "string") {
            if (props.editable) {
                return (
                    <TextInput
                        style={styles.stringInput}
                        value={value}
                        onChangeText={function (v) {
                            return props.onValueChange(line.path, v);
                        }}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                );
            }
            return <UnText style={styles.valueString}>{'"' + value + '"'}</UnText>;
        }

        return <UnText>{String(value)}</UnText>;
    };

    return (
        <View style={styles.row}>
            {/* Indentation spacer */}
            <View style={{width: line.depth * 20}} />

            {/* Key */}
            {renderKey()}

            {/* Colon */}
            <UnText style={styles.colon}>:</UnText>

            {/* Value */}
            <View style={{flex: 1}}>{renderValue()}</View>

            {/* Delete button */}
            {props.editable && (
                <UnPressable
                    style={styles.deleteBtn}
                    onPress={function () {
                        return props.onDelete(line.path);
                    }}
                    android_ripple={{color: theme.colors.grey4}}>
                    <Icon name="close" size={14} color={dimColor} />
                </UnPressable>
            )}
        </View>
    );
}

// ─── CollapsibleLine ──────────────────────────────────────

type CollapsibleLineProps = {
    line: JsonLine;
    isCollapsed: boolean;
    isExpandedEnd: boolean;
    onToggle: (path: (string | number)[]) => void;
    editable: boolean;
    replacing: boolean;
    onStartReplace: (pathKey: string) => void;
    onFinishReplace: (path: (string | number)[], text: string) => void;
    onDelete: (path: (string | number)[]) => void;
    onAddItem: (path: (string | number)[]) => void;
    theme: ReturnType<typeof useTheme>["theme"];
};

function CollapsibleLine(props: CollapsibleLineProps) {
    const line = props.line;
    const theme = props.theme;
    const dimColor = Color(theme.colors.black).setAlpha(0.5).rgbaString;
    const isObject = line.collapsibleType === "object";
    const isArray = line.collapsibleType === "array";

    const replaceValueState = useState("");
    const replaceValue = replaceValueState[0];
    const setReplaceValue = replaceValueState[1];

    const styles = useMemo(
        function () {
            return StyleSheet.create({
                headerRow: {
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    paddingVertical: 4,
                },
                keyText: {
                    fontFamily: MONO_FONT,
                    fontSize: 13,
                    fontWeight: "600",
                    color: theme.colors.black,
                },
                colon: {
                    fontFamily: MONO_FONT,
                    fontSize: 13,
                    color: dimColor,
                },
                tag: {
                    fontFamily: MONO_FONT,
                    fontSize: 11,
                    color: dimColor,
                },
                replaceInput: {
                    fontFamily: MONO_FONT,
                    fontSize: 12,
                    color: theme.colors.black,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.grey4,
                    paddingVertical: 0,
                    paddingHorizontal: 4,
                    minWidth: 80,
                    maxWidth: 150,
                },
                actionBtn: {
                    padding: 2,
                    marginLeft: 4,
                },
                closeTag: {
                    marginLeft: (line.depth + 1) * 20,
                    paddingVertical: 2,
                },
                addRow: {
                    marginLeft: (line.depth + 1) * 20,
                    paddingVertical: 4,
                },
            });
        },
        [theme, dimColor, line.depth],
    );

    const handleReplaceSubmit = function () {
        props.onFinishReplace(line.path, replaceValue);
        setReplaceValue("");
    };

    const badge = isObject ? "{…} " + line.childCount + " keys" : "[…] " + line.childCount + " items";

    const renderContent = function () {
        // Replacing mode
        if (props.replacing) {
            return (
                <TextInput
                    style={styles.replaceInput}
                    value={replaceValue}
                    onChangeText={function (v) {
                        return setReplaceValue(v);
                    }}
                    onSubmitEditing={handleReplaceSubmit}
                    onBlur={handleReplaceSubmit}
                    placeholder={isObject ? "new value" : "new value"}
                    placeholderTextColor={dimColor}
                    autoFocus
                    autoCapitalize="none"
                    autoCorrect={false}
                />
            );
        }

        // Collapsed: show type badge
        if (props.isCollapsed) {
            return <UnText style={styles.tag}>{badge}</UnText>;
        }

        // Expanded: show opening bracket
        return <UnText style={styles.tag}>{isObject ? "{" : "["}</UnText>;
    };

    return (
        <View>
            {/* Header row */}
            <View style={[styles.headerRow, {marginLeft: line.depth * 20}]}>
                {/* Toggle chevron + key */}
                <UnPressable
                    onPress={function () {
                        return props.onToggle(line.path);
                    }}
                    android_ripple={{color: theme.colors.grey4}}
                    style={{flex: 1}}>
                    <Flex inline gap={4} align="center">
                        <Icon name={props.isCollapsed ? "chevron-right" : "chevron-down"} size={16} color={dimColor} />
                        <UnText style={styles.keyText}>{line.key}</UnText>
                        <UnText style={styles.colon}>:</UnText>
                        {renderContent()}
                    </Flex>
                </UnPressable>

                {/* Replace button */}
                {props.editable && !props.replacing && (
                    <UnPressable
                        style={styles.actionBtn}
                        onPress={function () {
                            props.onStartReplace(pathKey(line.path));
                            setReplaceValue("");
                        }}
                        android_ripple={{color: theme.colors.grey4}}>
                        <Icon name="pencil" size={14} color={dimColor} />
                    </UnPressable>
                )}

                {/* Delete button */}
                {props.editable && (
                    <UnPressable
                        style={styles.actionBtn}
                        onPress={function () {
                            return props.onDelete(line.path);
                        }}
                        android_ripple={{color: theme.colors.grey4}}>
                        <Icon name="close" size={14} color={dimColor} />
                    </UnPressable>
                )}
            </View>

            {/* Closing tag + add button when expanded */}
            {!props.isCollapsed && props.isExpandedEnd && (
                <View>
                    {/* Add button */}
                    {props.editable && (
                        <View style={styles.addRow}>
                            <UnPressable
                                onPress={function () {
                                    return props.onAddItem(line.path);
                                }}
                                android_ripple={{color: theme.colors.grey4}}>
                                <Flex inline gap={4} align="center">
                                    <Icon name="plus" size={14} color={dimColor} />
                                    <UnText style={styles.tag}>{isObject ? "add key" : "add item"}</UnText>
                                </Flex>
                            </UnPressable>
                        </View>
                    )}
                    {/* Closing bracket */}
                    <View style={styles.closeTag}>
                        <UnText style={styles.tag}>{isObject ? "}" : "]"}</UnText>
                    </View>
                </View>
            )}
        </View>
    );
}

// ─── UnJsonEditor ─────────────────────────────────────────

function UnJsonEditorFn({
    value,
    onChange,
    editable: controlledEditable,
    defaultEditable,
    onEditableChange,
    maxHeight,
    readOnly,
    showCopy,
    style,
    ...viewProps
}: UnJsonEditorProps) {
    const theme = useTheme().theme;
    const _defaultEditable = defaultEditable !== undefined ? defaultEditable : true;
    const _readOnly = readOnly !== undefined ? readOnly : false;
    const _showCopy = showCopy !== undefined ? showCopy : true;

    const internalEditableState = useState(_defaultEditable);
    const internalEditable = internalEditableState[0];
    const setInternalEditable = internalEditableState[1];

    const internalValueState = useState(value);
    const internalValue = internalValueState[0];
    const setInternalValue = internalValueState[1];

    const collapsedState = useState<Record<string, boolean>>({});
    const collapsed = collapsedState[0];
    const setCollapsed = collapsedState[1];

    const editingKeyPathState = useState<string | null>(null);
    const editingKeyPath = editingKeyPathState[0];
    const setEditingKeyPath = editingKeyPathState[1];

    const replacingPathState = useState<string | null>(null);
    const replacingPath = replacingPathState[0];
    const setReplacingPath = replacingPathState[1];

    const isEditable = controlledEditable !== undefined ? controlledEditable : internalEditable;
    const currentValue = onChange ? value : internalValue;

    // Sync external value changes
    React.useEffect(
        function () {
            if (onChange) {
                setInternalValue(value);
            }
        },
        [value, onChange],
    );

    const dimColor = Color(theme.colors.black).setAlpha(0.5).rgbaString;

    const styles = useMemo(
        function () {
            return StyleSheet.create({
                container: {
                    borderRadius: 8,
                    padding: 8,
                    backgroundColor: Color.mix(theme.colors.primary, theme.colors.background, 0.5).setAlpha(0.3)
                        .rgbaString,
                    borderWidth: 1,
                    borderColor: Color(theme.colors.primary).setAlpha(0.15).rgbaString,
                },
                toolbar: {
                    marginBottom: 6,
                },
                toolbarBtn: {
                    padding: 4,
                    borderRadius: 4,
                },
                emptyText: {
                    fontFamily: MONO_FONT,
                    fontSize: 13,
                    color: dimColor,
                    fontStyle: "italic",
                },
            });
        },
        [theme, dimColor],
    );

    // Flatten JSON tree into lines
    const allLines = useMemo(
        function () {
            const lines: JsonLine[] = [];
            if (currentValue !== undefined) {
                flattenJson(currentValue, "root", [], 0, lines);
            }
            return lines;
        },
        [currentValue],
    );

    // Filter to visible lines based on collapsed state
    const visibleLines = useMemo(
        function () {
            return computeVisibleLines(allLines, collapsed, AUTO_EXPAND_DEPTH);
        },
        [allLines, collapsed],
    );

    const handleFieldChange = useCallback(
        function (path: (string | number)[], newValue: unknown) {
            const newRoot = setByPath(currentValue, path, newValue);
            if (onChange) {
                onChange(newRoot);
            } else {
                setInternalValue(newRoot);
            }
        },
        [currentValue, onChange],
    );

    const handleKeyRename = useCallback(
        function (path: (string | number)[], oldKey: string, newKey: string) {
            if (oldKey === newKey) return;
            const parentPath = path.slice(0, path.length - 1);
            const parentValue = getByPath(currentValue, parentPath);
            if (parentValue && typeof parentValue === "object" && !Array.isArray(parentValue)) {
                const obj = parentValue as Record<string, unknown>;
                const newObj: Record<string, unknown> = {};
                const keys = Object.keys(obj);
                for (let i = 0; i < keys.length; i++) {
                    const k = keys[i];
                    if (k === oldKey) {
                        newObj[newKey] = obj[k];
                    } else {
                        newObj[k] = obj[k];
                    }
                }
                handleFieldChange(parentPath, newObj);
                setEditingKeyPath(null);
            }
        },
        [currentValue, handleFieldChange],
    );

    const handleDelete = useCallback(
        function (path: (string | number)[]) {
            if (path.length === 0) return;
            const parentPath = path.slice(0, path.length - 1);
            const lastSeg = path[path.length - 1];
            const parentValue = getByPath(currentValue, parentPath);
            if (Array.isArray(parentValue)) {
                const arrCopy = (parentValue as unknown[]).slice();
                arrCopy.splice(lastSeg as number, 1);
                handleFieldChange(parentPath, arrCopy);
            } else if (parentValue && typeof parentValue === "object") {
                const obj = parentValue as Record<string, unknown>;
                const newObj: Record<string, unknown> = {};
                const keys = Object.keys(obj);
                for (let i = 0; i < keys.length; i++) {
                    const k = keys[i];
                    if (k !== String(lastSeg)) {
                        newObj[k] = obj[k];
                    }
                }
                handleFieldChange(parentPath, newObj);
            }
        },
        [currentValue, handleFieldChange],
    );

    const handleReplaceCollapsible = useCallback(
        function (path: (string | number)[], text: string) {
            const trimmed = text.trim();
            let newValue: unknown = trimmed;
            if (trimmed === "null") newValue = null;
            else if (trimmed === "true") newValue = true;
            else if (trimmed === "false") newValue = false;
            else {
                const num = parseFloat(trimmed);
                if (!isNaN(num) && String(num) === trimmed) newValue = num;
            }
            handleFieldChange(path, newValue);
            setReplacingPath(null);
        },
        [handleFieldChange],
    );

    const handleAddItem = useCallback(
        function (path: (string | number)[]) {
            const container = getByPath(currentValue, path);
            if (Array.isArray(container)) {
                handleFieldChange(path, (container as unknown[]).concat([null]));
            } else if (container && typeof container === "object") {
                const obj = container as Record<string, unknown>;
                let newKey = "newKey";
                let counter = 1;
                while (newKey in obj) {
                    newKey = "newKey_" + counter;
                    counter = counter + 1;
                }
                const newObj: Record<string, unknown> = {};
                const keys = Object.keys(obj);
                for (let i = 0; i < keys.length; i++) {
                    newObj[keys[i]] = obj[keys[i]];
                }
                newObj[newKey] = null;
                handleFieldChange(path, newObj);
            }
        },
        [currentValue, handleFieldChange],
    );

    const toggleEditable = useCallback(
        function () {
            const next = !isEditable;
            if (controlledEditable === undefined) {
                setInternalEditable(next);
            }
            if (onEditableChange) onEditableChange(next);
        },
        [isEditable, controlledEditable, onEditableChange],
    );

    const handleCopy = useCallback(
        function () {
            try {
                Clipboard.setString(JSON.stringify(currentValue, null, 2));
            } catch (_e) {
                Clipboard.setString(String(currentValue));
            }
        },
        [currentValue],
    );

    const handleToggleCollapse = useCallback(function (path: (string | number)[]) {
        const pk = pathKey(path);
        setCollapsed(function (prev) {
            const next: Record<string, boolean> = {};
            const prevKeys = Object.keys(prev);
            for (let i = 0; i < prevKeys.length; i++) {
                next[prevKeys[i]] = prev[prevKeys[i]];
            }
            if (next[pk]) {
                next[pk] = false;
            } else {
                next[pk] = true;
            }
            return next;
        });
    }, []);

    if (currentValue === undefined) {
        return (
            <View style={[styles.container, style]} {...viewProps}>
                <UnText style={styles.emptyText}>No data</UnText>
            </View>
        );
    }

    return (
        <View style={[styles.container, style]} {...viewProps}>
            {!_readOnly && (
                <Flex inline justify="space-between" gap={8} style={styles.toolbar}>
                    <UnPressable
                        style={styles.toolbarBtn}
                        onPress={toggleEditable}
                        android_ripple={{color: theme.colors.grey4}}>
                        <Icon
                            name={isEditable ? "eye" : "pencil"}
                            size={18}
                            color={isEditable ? dimColor : theme.colors.primary}
                        />
                    </UnPressable>
                    {_showCopy && (
                        <UnPressable
                            style={styles.toolbarBtn}
                            onPress={handleCopy}
                            android_ripple={{color: theme.colors.grey4}}>
                            <Icon name="content-copy" size={16} color={dimColor} />
                        </UnPressable>
                    )}
                </Flex>
            )}
            <ScrollView
                style={maxHeight ? {maxHeight: maxHeight} : undefined}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled">
                {visibleLines.map(function (line, index) {
                    // Check if this is the last expanded child of a collapsible
                    let isExpandedEnd = false;
                    if (line.kind === LINE_KIND_PRIMITIVE || line.kind === LINE_KIND_COLLAPSIBLE) {
                        const nextLine = visibleLines[index + 1];
                        if (!nextLine || nextLine.depth <= line.depth) {
                            isExpandedEnd = true;
                        }
                    }

                    if (line.kind === LINE_KIND_COLLAPSIBLE) {
                        const pk = pathKey(line.path);
                        const isCollapsed =
                            !!collapsed[pk] || (line.depth >= AUTO_EXPAND_DEPTH && collapsed[pk] === undefined);
                        return (
                            <CollapsibleLine
                                key={pk}
                                line={line}
                                isCollapsed={isCollapsed}
                                isExpandedEnd={isExpandedEnd}
                                onToggle={handleToggleCollapse}
                                editable={isEditable && !_readOnly}
                                replacing={replacingPath === pk}
                                onStartReplace={function (key) {
                                    return setReplacingPath(key);
                                }}
                                onFinishReplace={handleReplaceCollapsible}
                                onDelete={handleDelete}
                                onAddItem={handleAddItem}
                                theme={theme}
                            />
                        );
                    }

                    // Primitive line
                    const linePk = pathKey(line.path);
                    return (
                        <PrimitiveLine
                            key={linePk}
                            line={line}
                            editable={isEditable && !_readOnly}
                            editingKey={editingKeyPath === linePk}
                            onStartEditKey={function (key) {
                                return setEditingKeyPath(key);
                            }}
                            onFinishEditKey={handleKeyRename}
                            onValueChange={handleFieldChange}
                            onDelete={handleDelete}
                            theme={theme}
                        />
                    );
                })}
            </ScrollView>
        </View>
    );
}

// ─── UnJsonEditor.Modal ──────────────────────────────────

function UnJsonEditorModal({visible, onClose, title, animationType, ...editorProps}: UnJsonEditorModalProps) {
    const theme = useTheme().theme;
    const _animationType = animationType !== undefined ? animationType : "slide";

    const styles = useMemo(
        function () {
            return StyleSheet.create({
                safeArea: {
                    flex: 1,
                    backgroundColor: theme.colors.background,
                },
                header: {
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: Color(theme.colors.black).setAlpha(0.1).rgbaString,
                },
                headerTitle: {
                    fontSize: 17,
                    fontWeight: "600",
                    color: theme.colors.black,
                },
                headerBtn: {
                    padding: 4,
                    borderRadius: 4,
                },
                body: {
                    flex: 1,
                    padding: 8,
                },
            });
        },
        [theme],
    );

    return (
        <Modal visible={visible} animationType={_animationType} onRequestClose={onClose} presentationStyle="pageSheet">
            <SafeAreaView style={styles.safeArea}>
                <StatusBar
                    barStyle={
                        theme.colors.black === "#000000" || Color(theme.colors.black).luminance < 0.5
                            ? "light-content"
                            : "dark-content"
                    }
                />
                <View style={styles.header}>
                    <UnPressable
                        style={styles.headerBtn}
                        onPress={onClose}
                        android_ripple={{color: theme.colors.grey4}}>
                        <Icon name="close" size={22} color={theme.colors.black} />
                    </UnPressable>
                    <UnText style={styles.headerTitle}>{title || "JSON Editor"}</UnText>
                    <View style={{width: 30}} />
                </View>
                <View style={styles.body}>
                    <UnJsonEditorFn {...editorProps} style={{flex: 1}} />
                </View>
            </SafeAreaView>
        </Modal>
    );
}

// ─── Export with Modal attached ──────────────────────────

const UnJsonEditor: typeof UnJsonEditorFn & {Modal: typeof UnJsonEditorModal} = UnJsonEditorFn as any;
UnJsonEditor.Modal = UnJsonEditorModal;
export {UnJsonEditor};
