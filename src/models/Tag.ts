import { ta } from "element-plus/es/locale";

export interface Tag {
    name: string,
    aliases: string[],
    description: string,
    id: number,
    contexts: number[]
}

export function addAlias(alias: string, aliases: string []) {
    alias = alias.toLowerCase();
    for (var i = 0, len = aliases.length; i < len; i++) {
        if (alias === aliases[i]) {
            return
        }
        if (alias < aliases[i]) {
            aliases.splice(i, 0, alias);
            return;
        }
    }

    aliases.push(alias)
}

export function hasName(tag: Tag, name: string): boolean {
    name = name.toLowerCase();
    if (name == tag.name.toLowerCase()) {
        return true;
    }

    for (let i = 0; i < tag.aliases.length; i++) {
        if (tag.aliases[i] == name) {
            return true;
        }
    }

    return false;
}