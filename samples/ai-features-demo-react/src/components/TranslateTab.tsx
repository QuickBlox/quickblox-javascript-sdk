import React, { useState } from 'react';
import { SUPPORTED_LANGUAGES } from '../types/quickblox';

interface TranslateTabProps {
    assistantId: string;
    onTranslate: (text: string, lang: string) => Promise<{ answer: string }>;
    onLog: (message: string) => void;
}

export const TranslateTab: React.FC<TranslateTabProps> = ({
    assistantId,
    onTranslate,
    onLog,
}) => {
    const [text, setText] = useState('Hello, how are you?');
    const [lang, setLang] = useState('es');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const translate = async () => {
        if (!assistantId) {
            onLog('ERROR: Smart Chat Assistant ID is required');
            return;
        }

        const inputText = text.trim();
        if (!inputText) {
            onLog('ERROR: Please enter text to translate');
            return;
        }

        setIsLoading(true);
        setIsError(false);
        setResponse('Loading...');

        const langName = SUPPORTED_LANGUAGES.find((l) => l.code === lang)?.name || lang;
        onLog(`Translating to ${langName}: "${inputText.substring(0, 30)}..."`);

        try {
            const result = await onTranslate(inputText, lang);
            setResponse(result.answer);
            onLog('Translation received');
        } catch (err) {
            setIsError(true);
            setResponse(`Error: ${err}`);
            onLog(`ERROR: Translate failed - ${err}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h3 className="section-title">QB.ai.translate()</h3>
            <p className="section-description">
                Translate text to selected language
            </p>

            <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                    <label>Text to translate</label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter text to translate..."
                    />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                    <label>Target Language</label>
                    <select value={lang} onChange={(e) => setLang(e.target.value)}>
                        {SUPPORTED_LANGUAGES.map((language) => (
                            <option key={language.code} value={language.code}>
                                {language.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <button
                className="btn btn-primary"
                onClick={translate}
                disabled={isLoading}
            >
                Translate
            </button>

            <div className="response-section">
                <h4>Result:</h4>
                <div className={`response-box ${isLoading ? 'loading' : ''} ${isError ? 'error' : ''}`}>
                    {response}
                </div>
            </div>
        </div>
    );
};
