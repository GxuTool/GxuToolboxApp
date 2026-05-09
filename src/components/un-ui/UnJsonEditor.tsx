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

type ExpandedPaths = Record<string, boolean>;

type JsonFieldProps = {
    value: unknown;
    path: (string | number)[];
    depth: number;
    editable: boolean;
    expandedPaths: ExpandedPaths;
    onToggleExpand: (pathKey: string) => void;
    onChange: (path: (string | number)[], newValue: unknown) => void;
};

// ─── Utilities ───────────────────────────────────────────

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

// ─── Type colors ─────────────────────────────────────────

var TYPE_COLORS = {
    string: "#4caf50",
    number: "#42a5f5",
    boolean: "#ab47bc",
    null: "#9e9e9e",
    key: "#333333",
};

var MONO_FONT = Platform.select({ ios: "Menlo", android: "monospace" });

// ─── JsonField ───────────────────────────────────────────

function JsonField({
    value,
    path,
    depth,
    editable,
    expandedPaths,
    onToggleExpand,
    onChange,
}: JsonFieldProps) {
    var theme = useTheme().theme;
    var pKey = pathKey(path);
    var isExpanded = !!expandedPaths[pKey] || depth < 2;
    var nullEditingState = useState(false);
    var nullEditing = nullEditingState[0];
    var setNullEditing = nullEditingState[1];

    var dimColor = Color(theme.colors.black).setAlpha(0.5).rgbaString;

    var styles = useMemo(
        function () {
            return StyleSheet.create({
                row: {
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    marginVertical: 2,
                    marginLeft: depth > 0 ? 8 : 0,
                },
                headerRow: {
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    paddingVertical: 4,
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
                },
                keyText: {
                    fontFamily: MONO_FONT,
                    fontSize: 13,
                    fontWeight: "600",
                    color: TYPE_COLORS.key,
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
                valueText: {
                    fontFamily: MONO_FONT,
                    fontSize: 13,
                },
                tag: {
                    fontFamily: MONO_FONT,
                    fontSize: 11,
                    color: dimColor,
                },
                nullPressable: {
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: theme.colors.grey4,
                    borderStyle: "dashed",
                },
                indent: {
                    marginLeft: depth > 0 ? 16 : 0,
                },
                deleteBtn: {
                    padding: 2,
                },
            });
        },
        [theme, dimColor, depth],
    );

    // ── Null ──────────────────────────────────────────

    if (value === null) {
        if (editable) {
            if (nullEditing) {
                return (
                    <TextInput
                        style={styles.stringInput}
                        value=""
                        placeholder="null"
                        placeholderTextColor={dimColor}
                        onChangeText={function (v) {
                            onChange(path, v);
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
                <UnPressable style={styles.nullPressable} onPress={function () { return setNullEditing(true); }}>
                    <UnText style={[styles.valueText, { color: TYPE_COLORS.null, fontStyle: "italic" }]}>
                        null
                    </UnText>
                </UnPressable>
            );
        }
        return (
            <UnText style={[styles.valueText, { color: TYPE_COLORS.null, fontStyle: "italic" }]}>
                null
            </UnText>
        );
    }

    // ── Boolean ───────────────────────────────────────

    if (typeof value === "boolean") {
        if (editable) {
            return (
                <Switch
                    value={value}
                    onValueChange={function (v) { return onChange(path, v); }}
                    trackColor={{ false: theme.colors.grey4, true: TYPE_COLORS.boolean }}
                />
            );
        }
        return (
            <UnText style={[styles.valueText, { color: TYPE_COLORS.boolean }]}>
                {value ? "true" : "false"}
            </UnText>
        );
    }

    // ── Number ────────────────────────────────────────

    if (typeof value === "number") {
        if (editable) {
            return (
                <NumberInput
                    value={value}
                    onChange={function (v) {
                        if (!isNaN(v)) onChange(path, v);
                    }}
                />
            );
        }
        return (
            <UnText style={[styles.valueText, { color: TYPE_COLORS.number }]}>
                {String(value)}
            </UnText>
        );
    }

    // ── String ────────────────────────────────────────

    if (typeof value === "string") {
        if (editable) {
            return (
                <TextInput
                    style={styles.stringInput}
                    value={value}
                    onChangeText={function (v) { return onChange(path, v); }}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
            );
        }
        return (
            <UnText style={[styles.valueText, { color: TYPE_COLORS.string }]}>
                {"\"" + value + "\""}
            </UnText>
        );
    }

    // ── Array ─────────────────────────────────────────

    if (Array.isArray(value)) {
        var arr = value as unknown[];

        var handleDeleteItem = function (index: number) {
            var copy = arr.slice();
            copy.splice(index, 1);
            onChange(path, copy);
        };

        var handleAddItem = function () {
            onChange(path, arr.concat([null]));
        };

        return (
            <View style={styles.indent}>
                <UnPressable
                    android_ripple={{ color: theme.colors.grey4 }}
                    onPress={function () { return onToggleExpand(pKey); }}>
                    <View style={styles.headerRow}>
                        <Icon
                            name={isExpanded ? "chevron-down" : "chevron-right"}
                            size={16}
                            color={dimColor}
                        />
                        <UnText style={styles.tag}>
                            {isExpanded ? "[" : "[ … ] " + arr.length + " items"}
                        </UnText>
                    </View>
                </UnPressable>
                {isExpanded && (
                    <View>
                        {arr.map(function (item, i) {
                            return (
                                <View key={String(i)} style={styles.row}>
                                    <UnText style={styles.tag}>{"[" + i + "]"}</UnText>
                                    <JsonField
                                        value={item}
                                        path={path.concat([i])}
                                        depth={depth + 1}
                                        editable={editable}
                                        expandedPaths={expandedPaths}
                                        onToggleExpand={onToggleExpand}
                                        onChange={onChange}
                                    />
                                    {editable && (
                                        <UnPressable
                                            style={styles.deleteBtn}
                                            onPress={function () { return handleDeleteItem(i); }}
                                            android_ripple={{ color: theme.colors.grey4 }}>
                                            <Icon name="close" size={14} color={dimColor} />
                                        </UnPressable>
                                    )}
                                </View>
                            );
                        })}
                        {arr.length === 0 && (
                            <UnText style={[styles.tag, { marginLeft: 24 }]}>empty</UnText>
                        )}
                        {editable && (
                            <UnPressable
                                style={{ marginLeft: 24, marginTop: 4 }}
                                onPress={handleAddItem}
                                android_ripple={{ color: theme.colors.grey4 }}>
                                <Flex inline gap={4}>
                                    <Icon name="plus" size={14} color={dimColor} />
                                    <UnText style={styles.tag}>add item</UnText>
                                </Flex>
                            </UnPressable>
                        )}
                        <UnText style={styles.tag}>]</UnText>
                    </View>
                )}
            </View>
        );
    }

    // ── Object ────────────────────────────────────────

    if (typeof value === "object") {
        var obj = value as Record<string, unknown>;
        var keys = Object.keys(obj);

        var handleRenameKey = function (oldKey: string, newKey: string) {
            if (oldKey === newKey) return;
            var newObj: Record<string, unknown> = {};
            var allKeys = Object.keys(obj);
            for (var i = 0; i < allKeys.length; i++) {
                var k = allKeys[i];
                if (k === oldKey) {
                    newObj[newKey] = obj[k];
                } else {
                    newObj[k] = obj[k];
                }
            }
            onChange(path, newObj);
        };

        var handleDeleteKey = function (key: string) {
            var copy: Record<string, unknown> = {};
            var allKeys = Object.keys(obj);
            for (var i = 0; i < allKeys.length; i++) {
                var k = allKeys[i];
                if (k !== key) {
                    copy[k] = obj[k];
                }
            }
            onChange(path, copy);
        };

        var handleAddKey = function () {
            var newKey = "newKey";
            var counter = 1;
            while (newKey in obj) {
                newKey = "newKey_" + counter;
                counter++;
            }
            var copy: Record<string, unknown> = {};
            var allKeys = Object.keys(obj);
            for (var i = 0; i < allKeys.length; i++) {
                copy[allKeys[i]] = obj[allKeys[i]];
            }
            copy[newKey] = null;
            onChange(path, copy);
        };

        return (
            <View style={styles.indent}>
                <UnPressable
                    android_ripple={{ color: theme.colors.grey4 }}
                    onPress={function () { return onToggleExpand(pKey); }}>
                    <View style={styles.headerRow}>
                        <Icon
                            name={isExpanded ? "chevron-down" : "chevron-right"}
                            size={16}
                            color={dimColor}
                        />
                        <UnText style={styles.tag}>
                            {isExpanded ? "{" : "{ … } " + keys.length + " keys"}
                        </UnText>
                    </View>
                </UnPressable>
                {isExpanded && (
                    <View>
                        {keys.map(function (key) {
                            var val = obj[key];
                            return (
                                <View key={key} style={styles.row}>
                                    {editable ? (
                                        <TextInput
                                            style={styles.keyInput}
                                            value={key}
                                            onChangeText={function (newKey) { return handleRenameKey(key, newKey); }}
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                        />
                                    ) : (
                                        <UnText style={styles.keyText}>{key}</UnText>
                                    )}
                                    <UnText style={styles.tag}>:</UnText>
                                    <JsonField
                                        value={val}
                                        path={path.concat([key])}
                                        depth={depth + 1}
                                        editable={editable}
                                        expandedPaths={expandedPaths}
                                        onToggleExpand={onToggleExpand}
                                        onChange={onChange}
                                    />
                                    {editable && (
                                        <UnPressable
                                            style={styles.deleteBtn}
                                            onPress={function () { return handleDeleteKey(key); }}
                                            android_ripple={{ color: theme.colors.grey4 }}>
                                            <Icon name="close" size={14} color={dimColor} />
                                        </UnPressable>
                                    )}
                                </View>
                            );
                        })}
                        {keys.length === 0 && (
                            <UnText style={[styles.tag, { marginLeft: 24 }]}>empty</UnText>
                        )}
                        {editable && (
                            <UnPressable
                                style={{ marginLeft: 24, marginTop: 4 }}
                                onPress={handleAddKey}
                                android_ripple={{ color: theme.colors.grey4 }}>
                                <Flex inline gap={4}>
                                    <Icon name="plus" size={14} color={dimColor} />
                                    <UnText style={styles.tag}>add key</UnText>
                                </Flex>
                            </UnPressable>
                        )}
                        <UnText style={styles.tag}>{"}"}</UnText>
                    </View>
                )}
            </View>
        );
    }

    // ── Fallback ──────────────────────────────────────

    return <UnText style={styles.tag}>{String(value)}</UnText>;
}

// ─── Modal Props ──────────────────────────────────────────

export interface UnJsonEditorModalProps extends Omit<UnJsonEditorProps, "style"> {
    visible: boolean;
    onClose: () => void;
    title?: string;
    animationType?: "none" | "slide" | "fade";
}

// ─── UnJsonEditor ────────────────────────────────────────

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
    var _defaultEditable = defaultEditable !== undefined ? defaultEditable : false;
    var _readOnly = readOnly !== undefined ? readOnly : false;
    var _showCopy = showCopy !== undefined ? showCopy : true;

    var internalEditableState = useState(_defaultEditable);
    var internalEditable = internalEditableState[0];
    var setInternalEditable = internalEditableState[1];

    var internalValueState = useState(value);
    var internalValue = internalValueState[0];
    var setInternalValue = internalValueState[1];

    var expandedPathsState = useState<ExpandedPaths>({});
    var expandedPaths = expandedPathsState[0];
    var setExpandedPaths = expandedPathsState[1];

    var isEditable = controlledEditable !== undefined ? controlledEditable : internalEditable;
    var currentValue = onChange ? value : internalValue;

    // Sync external value changes
    React.useEffect(function () {
        if (onChange) {
            setInternalValue(value);
        }
    }, [value, onChange]);

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

    var handleToggleExpand = useCallback(
        function (pKey: string) {
            setExpandedPaths(function (prev) {
                var next: ExpandedPaths = {};
                var prevKeys = Object.keys(prev);
                for (var i = 0; i < prevKeys.length; i++) {
                    next[prevKeys[i]] = prev[prevKeys[i]];
                }
                if (next[pKey]) {
                    delete next[pKey];
                } else {
                    next[pKey] = true;
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
                <JsonField
                    value={currentValue}
                    path={[]}
                    depth={0}
                    editable={isEditable && !_readOnly}
                    expandedPaths={expandedPaths}
                    onToggleExpand={handleToggleExpand}
                    onChange={handleFieldChange}
                />
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
                    barStyle={theme.colors.black === "#000000" || Color(theme.colors.black).luminance < 0.5 ? "light-content" : "dark-content"}
                />
                <View style={styles.header}>
                    <UnPressable
                        style={styles.headerBtn}
                        onPress={onClose}
                        android_ripple={{ color: theme.colors.grey4 }}>
                        <Icon name="close" size={22} color={theme.colors.black} />
                    </UnPressable>
                    <UnText style={styles.headerTitle}>
                        {title || "JSON Editor"}
                    </UnText>
                    <View style={{ width: 30 }} />
                </View>
                <View style={styles.body}>
                    <UnJsonEditorFn
                        {...editorProps}
                        style={{ flex: 1 }}
                    />
                </View>
            </SafeAreaView>
        </Modal>
    );
}

// ─── Export with Modal attached ──────────────────────────

var UnJsonEditor: typeof UnJsonEditorFn & { Modal: typeof UnJsonEditorModal } = UnJsonEditorFn as any;
UnJsonEditor.Modal = UnJsonEditorModal;
export { UnJsonEditor };
