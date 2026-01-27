interface Node {
    children: Node[];
    parentNode?: Node;
    tag: string;
    attrs: {
        id?: string;
        class?: string;
        [key: string]: string | undefined;
    };
}

class HTMLNode implements Node {
    children: HTMLNode[] = [];
    parentNode?: HTMLNode;
    tag: string;
    attrs: Record<string, string>;

    constructor(tag: string, attrs: Record<string, string> = {}, parent?: HTMLNode) {
        this.tag = tag;
        this.attrs = attrs;
        this.parentNode = parent;
    }

    // 根据 ID 查找元素
    getElementById(id: string): HTMLNode | null {
        if (this.attrs.id === id) return this;

        for (const child of this.children) {
            const found = child.getElementById(id);
            if (found) return found;
        }

        return null;
    }

    // 根据类名查找元素
    getElementsByClassName(className: string): HTMLNode[] {
        const result: HTMLNode[] = [];

        const classes = this.attrs.class?.split(/\s+/) || [];
        if (classes.includes(className)) {
            result.push(this);
        }

        for (const child of this.children) {
            result.push(...child.getElementsByClassName(className));
        }

        return result;
    }

    // 根据标签名查找元素
    getElementsByTagName(tagName: string): HTMLNode[] {
        const result: HTMLNode[] = [];

        if (this.tag === tagName) {
            result.push(this);
        }

        for (const child of this.children) {
            result.push(...child.getElementsByTagName(tagName));
        }

        return result;
    }

    // 根据属性查找元素
    getElementsByAttribute(attr: string, value?: string): HTMLNode[] {
        const result: HTMLNode[] = [];

        if (this.attrs[attr] !== undefined && (!value || this.attrs[attr] === value)) {
            result.push(this);
        }

        for (const child of this.children) {
            result.push(...child.getElementsByAttribute(attr, value));
        }

        return result;
    }

    // 获取文本内容
    get textContent(): string {
        if (this.tag === "text") {
            return this.attrs.content || "";
        }
        return this.children.map(child => child.textContent).join("");
    }
}

function parseHTML(html: string): HTMLNode[] {
    // 创建虚拟根节点
    const root = new HTMLNode("root", {});
    let currentParent: HTMLNode = root;
    const stack: HTMLNode[] = [root];
    let index = 0;

    while (index < html.length) {
        // 跳过空白字符
        if (/[\s\n\t]/.test(html[index])) {
            index++;
            continue;
        }

        // 处理注释
        if (html.startsWith("<!--", index)) {
            const endIndex = html.indexOf("-->", index);
            if (endIndex === -1) break;
            index = endIndex + 3;
            continue;
        }

        // 处理结束标签
        if (html[index] === "<" && html[index + 1] === "/") {
            const endIndex = html.indexOf(">", index);
            if (endIndex === -1) break;

            const tagName = html.substring(index + 2, endIndex).trim();
            if (stack.length > 1 && stack[stack.length - 1].tag === tagName) {
                stack.pop();
                currentParent = stack[stack.length - 1];
            }
            index = endIndex + 1;
            continue;
        }

        // 处理开始标签
        if (html[index] === "<") {
            const endIndex = html.indexOf(">", index);
            if (endIndex === -1) break;

            const tagContent = html.substring(index + 1, endIndex);
            const isSelfClosing =
                tagContent.endsWith("/") ||
                ["img", "br", "input", "meta", "link"].includes(tagContent.trim().split(/\s+/)[0].toLowerCase());

            const cleanContent = isSelfClosing ? tagContent.replace(/\/$/, "").trim() : tagContent.trim();

            // 解析标签名和属性
            const spaceIndex = cleanContent.indexOf(" ");
            const tagName =
                spaceIndex === -1 ? cleanContent.toLowerCase() : cleanContent.substring(0, spaceIndex).toLowerCase();

            const attrs: Record<string, string> = {};
            if (spaceIndex !== -1) {
                const attrString = cleanContent.substring(spaceIndex + 1);
                const attrRegex = /([\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))?/g;
                let match: RegExpExecArray | null;

                while ((match = attrRegex.exec(attrString)) !== null) {
                    const name = match[1].toLowerCase();
                    const value = match[2] || match[3] || match[4] || "";
                    attrs[name] = value;
                }
            }

            // 创建新节点
            const newNode = new HTMLNode(tagName, attrs, currentParent);
            currentParent.children.push(newNode);

            // 非自闭合标签入栈
            if (!isSelfClosing) {
                stack.push(newNode);
                currentParent = newNode;
            }

            index = endIndex + 1;
            continue;
        }

        // 处理文本节点
        const nextOpen = html.indexOf("<", index);
        const textEnd = nextOpen === -1 ? html.length : nextOpen;
        const textContent = html.substring(index, textEnd).trim();

        if (textContent) {
            currentParent.children.push(new HTMLNode("text", {content: textContent}, currentParent));
        }

        index = textEnd;
    }

    return root.children;
}
