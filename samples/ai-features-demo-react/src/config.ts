import { QBConfig, QBUser } from './types/quickblox';

// Default configuration for quick testing
// Fill these values or enter manually in UI

export const DEFAULT_CONFIG: QBConfig = {
    appId: -1,
    authKey: '',
    authSecret: '',
    accountKey: '',
};

export const DEFAULT_USER: QBUser = {
    login: 'artimed',
    password: 'quickblox',
};

export const DEFAULT_SMART_CHAT_ASSISTANT_ID = '6633a1300fea600001bd6e71';

// Default image URL for testing (from QuickBlox documentation)
export const DEFAULT_IMAGE_URL = 'https://www.decorilla.com/online-decorating/wp-content/uploads/2024/06/Deep-rich-colors-and-vintage-velvet-chairs-define-this-dark-academia-aesthetic-by-Decorilla-scaled.jpg';
