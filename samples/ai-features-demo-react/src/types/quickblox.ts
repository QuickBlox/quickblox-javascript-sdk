// QuickBlox SDK Types for AI Features Demo

export interface QBConfig {
    appId: number;
    authKey: string;
    authSecret: string;
    accountKey: string;
}

export interface QBUser {
    login: string;
    password: string;
}

export interface QBSession {
    user_id: number;
    token: string;
}

// AI Gateway Types
export interface AIGatewayTextContent {
    type: 'text';
    text: string;
}

export interface AIGatewayImageContent {
    type: 'image_url';
    image_url: {
        url: string;
    };
}

export type AIGatewayContentItem = AIGatewayTextContent | AIGatewayImageContent;

export type AIGatewayRole = 'user' | 'assistant' | 'developer';

export interface AIGatewayMessage {
    role: AIGatewayRole;
    content: AIGatewayContentItem[] | string;
}

export interface AIGatewayResponse {
    answer: string;
}

// AI Summarize Types
export interface AISummarizeResponse {
    summary: string;
}

// AI Translate Types
export interface AITranslateResponse {
    answer: string;
}

// AI Answer Assist Types
export interface AIHistoryItem {
    role: 'user' | 'assistant';
    message: string;
}

export interface AIAnswerAssistResponse {
    answer: string;
}

// Dialog Types
export interface QBDialog {
    _id: string;
    name: string;
    type: number;
    unread_messages_count: number;
    updated_at: string;
}

export interface QBDialogListResult {
    items: QBDialog[];
}

// Supported Languages
export interface LanguageOption {
    code: string;
    name: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ru', name: 'Russian' },
    { code: 'uk', name: 'Ukrainian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'zh-Hans', name: 'Chinese (Simplified)' },
    { code: 'ar', name: 'Arabic' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'it', name: 'Italian' },
    { code: 'ko', name: 'Korean' },
    { code: 'pl', name: 'Polish' },
];
