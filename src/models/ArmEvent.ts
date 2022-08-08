export interface ArmEvent {
    id: number;
    timestamp: Date;
    title: string;
    tags: number[];
    description: string;
    context: number;
    pinned: boolean;
}

export interface filterOptions {
    words?: string[];
    anyWords?: boolean;
    tags?: number[];
    anyTags?: boolean;
    contexts?: number[];
    start?: Date;
    end?: Date;
}