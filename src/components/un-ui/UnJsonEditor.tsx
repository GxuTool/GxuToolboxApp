import {
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    TextInput,
    View,
    ViewProps,
} from "react-native";
import { useTheme } from "@rneui/themed";
import React, { useCallback, useMemo, useState } from "react";
import Clipboard from "@react-native-clipboard/clipboard";
import Flex from "./Flex";
import { Icon } from "./Icon";
import { NumberInput } from "./NumberInput";
import { UnText } from "./UnText";
import { Color } from "@/shared/color";
import { UnPressable } from "./UnPressable";

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

var LINE_KIND_PRIMITIVE = 0;
var LINE_KIND_COLLAPSIBLE = 1;

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

var TYPE_COLORS = {
    string: "#4caf50",
    number: "#42a5f5",
    boolean: "#ab47bc",
    null: "#9e9e9e",
    key: "#333333",
};

var MONO_FONT = Platform.select({ ios: "Menlo", android: "monospace" });

var AUTO_EXPAND_DEPTH = 2;

// ─── Utilities ────────────────────────────────────────────

function pathKey(path: (string | number)[]): string {
    return path.join(".");
}

function setByPath(obj: unknown, path: (string | number)[], value: unknown): unknown {
    if (path.length === 0) return value;
    var head = path[0];
    var rest = path.slice(1);
    if (Array.isArray(obj)) {
        var arrCopy = obj.slice();
        arrCopy[head as number] = setByPath(arrCopy[head as number], rest, value);
        return arrCopy;
    }
    if (obj && typeof obj === "object") {
        var record = obj as Record<string, unknown>;
        var objCopy: Record<string, unknown> = {};
        var keys = Object.keys(record);
        for (var i = 0; i < keys.length; i++) {
            objCopy[keys[i]] = record[keys[i]];
        }
        objCopy[head as string] = setByPath(objCopy[head as string], rest, value);
        return objCopy;
    }
    return obj;
}

function getByPath(obj: unknown, path: (string | number)[]): unknown {
    if (path.length === 0) return obj;
    var current = obj;
    for (var i = 0; i < path.length; i++) {
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

function flattenJson(
    value: unknown,
    key: string,
    path: (string | number)[],
    depth: number,
    result: JsonLine[],
): void {
    // Primitive values
    if (
        value === null ||
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
    ) {
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
        var arr = value as unknown[];
        result.push({
            key: key,
            value: value,
            depth: depth,
            path: path,
            kind: LINE_KIND_COLLAPSIBLE,
            collapsibleType: "array",
            childCount: arr.length,
        });
        for (var i = 0; i < arr.length; i++) {
            flattenJson(arr[i], "[" + i + "]", path.concat([i]), depth + 1, result);
        }
        return;
    }

    // Object
    if (value && typeof value === "object") {
        var obj = value as Record<string, unknown>;
        var keys = Object.keys(obj);
        result.push({
            key: key,
            value: value,
            depth: depth,
            path: path,
            kind: LINE_KIND_COLLAPSIBLE,
            collapsibleType: "object",
            childCount: keys.length,
        });
        for (var j = 0; j < keys.length; j++) {
            var k = keys[j];
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
    var result: JsonLine[] = [];
    var collapsedStack: number[] = [];

    for (var i = 0; i < allLines.length; i++) {
        var line = allLines[i];

        // Pop collapsed stack when depth moves out of collapsed region
        while (
            collapsedStack.length > 0 &&
            line.depth <= collapsedStack[collapsedStack.length - 1]
        ) {
            collapsedStack.pop();
        }

        // Skip if inside a collapsed region
        if (collapsedStack.length > 0) {
            continue;
        }

        // Check if this collapsible line is collapsed
        if (line.kind === LINE_KIND_COLLAPSIBLE) {
            var pk = pathKey(line.path);
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
    var line = props.line;
    var theme = props.theme;
    var value = line.value;
    var dimColor = Color(theme.colors.black).setAlpha(0.5).rgbaString;

    var nullEditingState = useState(false);
    var nullEditing = nullEditingState[0];
    var setNullEditing = nullEditingState[1];

    var keyEditValueState = useState(line.key);
    var keyEditValue = keyEditValueState[0];
    var setKeyEditValue = keyEditValueState[1];

    var styles = useMemo(
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
                    color: TYPE_COLORS.key,
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
                valueString: { fontFamily: MONO_FONT, fontSize: 13, color: TYPE_COLORS.string },
                valueNumber: { fontFamily: MONO_FONT, fontSize: 13, color: TYPE_COLORS.number },
                valueBoolean: { fontFamily: MONO_FONT, fontSize: 13, color: TYPE_COLORS.boolean },
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

    var handleKeySubmit = function () {
        var newKey = keyEditValue.trim();
        if (newKey && newKey !== line.key) {
            props.onFinishEditKey(line.path, line.key, newKey);
        }
        setKeyEditValue(line.key);
    };

    var renderKey = function () {
        if (props.editable && props.editingKey) {
            return (
                <TextInput
                    style={styles.keyInput}
                    value={keyEditValue}
                    onChangeText={function (v) { return setKeyEditValue(v); }}
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
                    android_ripple={{ color: theme.colors.grey4 }}>
                    <UnText style={styles.keyText}>{line.key}</UnText>
                </UnPressable>
            );
        }
        return <UnText style={styles.keyText}>{line.key}</UnText>;
    };

    var renderValue = function () {
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
                            onBlur={function () { return setNullEditing(false); }}
                            autoFocus
                        />
                    );
                }
                return (
                    <UnPressable
                        style={styles.nullPressable}
                        onPress={function () { return setNullEditing(true); }}
                        android_ripple={{ color: theme.colors.grey4 }}>
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
                        onValueChange={function (v) { return props.onValueChange(line.path, v); }}
                        trackColor={{ false: theme.colors.grey4, true: TYPE_COLORS.boolean }}
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
                        onChangeText={function (v) { return props.onValueChange(line.path, v); }}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                );
            }
            return <UnText style={styles.valueString}>{"\"" + value + "\""}</UnText>;
        }

        return <UnText>{String(value)}</UnText>;
    };

    return (
        <View style={styles.row}>
            {/* Indentation spacer */}
            <View style={{ width: line.depth * 20 }} />

            {/* Key */}
            {renderKey()}

            {/* Colon */}
            <UnText style={styles.colon}>:</UnText>

            {/* Value */}
            <View style={{ flex: 1 }}>{renderValue()}</View>

            {/* Delete button */}
            {props.editable && (
                <UnPressable
                    style={styles.deleteBtn}
                    onPress={function () { return props.onDelete(line.path); }}
                    android_ripple={{ color: theme.colors.grey4 }}>
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
    var line = props.line;
    var theme = props.theme;
    var dimColor = Color(theme.colors.black).setAlpha(0.5).rgbaString;
    var isObject = line.collapsibleType === "object";
    var isArray = line.collapsibleType === "array";

    var replaceValueState = useState("");
    var replaceValue = replaceValueState[0];
    var setReplaceValue = replaceValueState[1];

    var styles = useMemo(
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
                    color: TYPE_COLORS.key,
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

    var handleReplaceSubmit = function () {
        props.onFinishReplace(line.path, replaceValue);
        setReplaceValue("");
    };

    var badge = isObject
        ? "{…} " + line.childCount + " keys"
        : "[…] " + line.childCount + " items";

    var renderContent = function () {
        // Replacing mode
        if (props.replacing) {
            return (
                <TextInput
                    style={styles.replaceInput}
                    value={replaceValue}
                    onChangeText={function (v) { return setReplaceValue(v); }}
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
            <View style={[styles.headerRow, { marginLeft: line.depth * 20 }]}>
                {/* Toggle chevron + key */}
                <UnPressable
                    onPress={function () { return props.onToggle(line.path); }}
                    android_ripple={{ color: theme.colors.grey4 }}
                    style={{ flex: 1 }}>
                    <Flex inline gap={4} align="center">
                        <Icon
                            name={props.isCollapsed ? "chevron-right" : "chevron-down"}
                            size={16}
                            color={dimColor}
                        />
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
                        android_ripple={{ color: theme.colors.grey4 }}>
                        <Icon name="pencil" size={14} color={dimColor} />
                    </UnPressable>
                )}

                {/* Delete button */}
                {props.editable && (
                    <UnPressable
                        style={styles.actionBtn}
                        onPress={function () { return props.onDelete(line.path); }}
                        android_ripple={{ color: theme.colors.grey4 }}>
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
                                onPress={function () { return props.onAddItem(line.path); }}
                                android_ripple={{ color: theme.colors.grey4 }}>
                                <Flex inline gap={4} align="center">
                                    <Icon name="plus" size={14} color={dimColor} />
                                    <UnText style={styles.tag}>
                                        {isObject ? "add key" : "add item"}
                                    </UnText>
                                </Flex>
                            </UnPressable>
                        </View>
                    )}
                    {/* Closing bracket */}
                    <View style={styles.closeTag}>
                        <UnText style={styles.tag}>
                            {isObject ? "}" : "]"}
                        </UnText>
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
    var theme = useTheme().theme;
    var _defaultEditable = defaultEditable !== undefined ? defaultEditable : true;
    var _readOnly = readOnly !== undefined ? readOnly : false;
    var _showCopy = showCopy !== undefined ? showCopy : true;

    var internalEditableState = useState(_defaultEditable);
    var internalEditable = internalEditableState[0];
    var setInternalEditable = internalEditableState[1];

    var internalValueState = useState(value);
    var internalValue = internalValueState[0];
    var setInternalValue = internalValueState[1];

    var collapsedState = useState<Record<string, boolean>>({});
    var collapsed = collapsedState[0];
    var setCollapsed = collapsedState[1];

    var editingKeyPathState = useState<string | null>(null);
    var editingKeyPath = editingKeyPathState[0];
    var setEditingKeyPath = editingKeyPathState[1];

    var replacingPathState = useState<string | null>(null);
    var replacingPath = replacingPathState[0];
    var setReplacingPath = replacingPathState[1];

    var isEditable = controlledEditable !== undefined ? controlledEditable : internalEditable;
    var currentValue = onChange ? value : internalValue;

    // Sync external value changes
    React.useEffect(
        function () {
            if (onChange) {
                setInternalValue(value);
            }
        },
        [value, onChange],
    );

    var dimColor = Color(theme.colors.black).setAlpha(0.5).rgbaString;

    var styles = useMemo(
        function () {
            return StyleSheet.create({
                container: {
                    borderRadius: 8,
                    padding: 8,
                    backgroundColor: Color.mix(
                        theme.colors.primary,
                        theme.colors.background,
                        0.5,
                    ).setAlpha(0.3).rgbaString,
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
    var allLines = useMemo(
        function () {
            var lines: JsonLine[] = [];
            if (currentValue !== undefined) {
                flattenJson(currentValue, "root", [], 0, lines);
            }
            return lines;
        },
        [currentValue],
    );

    // Filter to visible lines based on collapsed state
    var visibleLines = useMemo(
        function () {
            return computeVisibleLines(allLines, collapsed, AUTO_EXPAND_DEPTH);
        },
        [allLines, collapsed],
    );

    var handleFieldChange = useCallback(
        function (path: (string | number)[], newValue: unknown) {
            var newRoot = setByPath(currentValue, path, newValue);
            if (onChange) {
                onChange(newRoot);
            } else {
                setInternalValue(newRoot);
            }
        },
        [currentValue, onChange],
    );

    var handleKeyRename = useCallback(
        function (path: (string | number)[], oldKey: string, newKey: string) {
            if (oldKey === newKey) return;
            var parentPath = path.slice(0, path.length - 1);
            var parentValue = getByPath(currentValue, parentPath);
            if (parentValue && typeof parentValue === "object" && !Array.isArray(parentValue)) {
                var obj = parentValue as Record<string, unknown>;
                var newObj: Record<string, unknown> = {};
                var keys = Object.keys(obj);
                for (var i = 0; i < keys.length; i++) {
                    var k = keys[i];
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

    var handleDelete = useCallback(
        function (path: (string | number)[]) {
            if (path.length === 0) return;
            var parentPath = path.slice(0, path.length - 1);
            var lastSeg = path[path.length - 1];
            var parentValue = getByPath(currentValue, parentPath);
            if (Array.isArray(parentValue)) {
                var arrCopy = (parentValue as unknown[]).slice();
                arrCopy.splice(lastSeg as number, 1);
                handleFieldChange(parentPath, arrCopy);
            } else if (parentValue && typeof parentValue === "object") {
                var obj = parentValue as Record<string, unknown>;
                var newObj: Record<string, unknown> = {};
                var keys = Object.keys(obj);
                for (var i = 0; i < keys.length; i++) {
                    var k = keys[i];
                    if (k !== String(lastSeg)) {
                        newObj[k] = obj[k];
                    }
                }
                handleFieldChange(parentPath, newObj);
            }
        },
        [currentValue, handleFieldChange],
    );

    var handleReplaceCollapsible = useCallback(
        function (path: (string | number)[], text: string) {
            var trimmed = text.trim();
            var newValue: unknown = trimmed;
            if (trimmed === "null") newValue = null;
            else if (trimmed === "true") newValue = true;
            else if (trimmed === "false") newValue = false;
            else {
                var num = parseFloat(trimmed);
                if (!isNaN(num) && String(num) === trimmed) newValue = num;
            }
            handleFieldChange(path, newValue);
            setReplacingPath(null);
        },
        [handleFieldChange],
    );

    var handleAddItem = useCallback(
        function (path: (string | number)[]) {
            var container = getByPath(currentValue, path);
            if (Array.isArray(container)) {
                handleFieldChange(path, (container as unknown[]).concat([null]));
            } else if (container && typeof container === "object") {
                var obj = container as Record<string, unknown>;
                var newKey = "newKey";
                var counter = 1;
                while (newKey in obj) {
                    newKey = "newKey_" + counter;
                    counter = counter + 1;
                }
                var newObj: Record<string, unknown> = {};
                var keys = Object.keys(obj);
                for (var i = 0; i < keys.length; i++) {
                    newObj[keys[i]] = obj[keys[i]];
                }
                newObj[newKey] = null;
                handleFieldChange(path, newObj);
            }
        },
        [currentValue, handleFieldChange],
    );

    var toggleEditable = useCallback(
        function () {
            var next = !isEditable;
            if (controlledEditable === undefined) {
                setInternalEditable(next);
            }
            if (onEditableChange) onEditableChange(next);
        },
        [isEditable, controlledEditable, onEditableChange],
    );

    var handleCopy = useCallback(
        function () {
            try {
                Clipboard.setString(JSON.stringify(currentValue, null, 2));
            } catch (_e) {
                Clipboard.setString(String(currentValue));
            }
        },
        [currentValue],
    );

    var handleToggleCollapse = useCallback(
        function (path: (string | number)[]) {
            var pk = pathKey(path);
            setCollapsed(function (prev) {
                var next: Record<string, boolean> = {};
                var prevKeys = Object.keys(prev);
                for (var i = 0; i < prevKeys.length; i++) {
                    next[prevKeys[i]] = prev[prevKeys[i]];
                }
                if (next[pk]) {
                    next[pk] = false;
                } else {
                    next[pk] = true;
                }
                return next;
            });
        },
        [],
    );

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
                        android_ripple={{ color: theme.colors.grey4 }}>
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
                            android_ripple={{ color: theme.colors.grey4 }}>
                            <Icon name="content-copy" size={16} color={dimColor} />
                        </UnPressable>
                    )}
                </Flex>
            )}
            <ScrollView
                style={maxHeight ? { maxHeight: maxHeight } : undefined}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled">
                {visibleLines.map(function (line, index) {
                    // Check if this is the last expanded child of a collapsible
                    var isExpandedEnd = false;
                    if (line.kind === LINE_KIND_PRIMITIVE || line.kind === LINE_KIND_COLLAPSIBLE) {
                        var nextLine = visibleLines[index + 1];
                        if (!nextLine || nextLine.depth <= line.depth) {
                            isExpandedEnd = true;
                        }
                    }

                    if (line.kind === LINE_KIND_COLLAPSIBLE) {
                        var pk = pathKey(line.path);
                        var isCollapsed = !!collapsed[pk] ||
                            (line.depth >= AUTO_EXPAND_DEPTH && collapsed[pk] === undefined);
                        return (
                            <CollapsibleLine
                                key={pk}
                                line={line}
                                isCollapsed={isCollapsed}
                                isExpandedEnd={isExpandedEnd}
                                onToggle={handleToggleCollapse}
                                editable={isEditable && !_readOnly}
                                replacing={replacingPath === pk}
                                onStartReplace={function (key) { return setReplacingPath(key); }}
                                onFinishReplace={handleReplaceCollapsible}
                                onDelete={handleDelete}
                                onAddItem={handleAddItem}
                                theme={theme}
                            />
                        );
                    }

                    // Primitive line
                    var linePk = pathKey(line.path);
                    return (
                        <PrimitiveLine
                            key={linePk}
                            line={line}
                            editable={isEditable && !_readOnly}
                            editingKey={editingKeyPath === linePk}
                            onStartEditKey={function (key) { return setEditingKeyPath(key); }}
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

function UnJsonEditorModal({
    visible,
    onClose,
    title,
    animationType,
    ...editorProps
}: UnJsonEditorModalProps) {
    var theme = useTheme().theme;
    var _animationType = animationType !== undefined ? animationType : "slide";

    var styles = useMemo(
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
        <Modal
            visible={visible}
            animationType={_animationType}
            onRequestClose={onClose}
            presentationStyle="pageSheet">
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
                        android_ripple={{ color: theme.colors.grey4 }}>
                        <Icon name="close" size={22} color={theme.colors.black} />
                    </UnPressable>
                    <UnText style={styles.headerTitle}>{title || "JSON Editor"}</UnText>
                    <View style={{ width: 30 }} />
                </View>
                <View style={styles.body}>
                    <UnJsonEditorFn {...editorProps} style={{ flex: 1 }} />
                </View>
            </SafeAreaView>
        </Modal>
    );
}

// ─── Export with Modal attached ──────────────────────────

var UnJsonEditor: typeof UnJsonEditorFn & { Modal: typeof UnJsonEditorModal } = UnJsonEditorFn as any;
UnJsonEditor.Modal = UnJsonEditorModal;
export { UnJsonEditor };
