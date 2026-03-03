import React, { useState, useRef } from 'react';
import { AIGatewayMessage } from '../types/quickblox';
import { DEFAULT_IMAGE_URL } from '../config';

interface GatewayTabProps {
    assistantId: string;
    onGateway: (messages: AIGatewayMessage[]) => Promise<{ answer: string }>;
    onLog: (message: string) => void;
}

export const GatewayTab: React.FC<GatewayTabProps> = ({
    assistantId,
    onGateway,
    onLog,
}) => {
    const [message, setMessage] = useState('What is QuickBlox?');
    const [imageUrl, setImageUrl] = useState(DEFAULT_IMAGE_URL);
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const callGateway = async (messages: AIGatewayMessage[], description: string) => {
        if (!assistantId) {
            onLog('ERROR: Smart Chat Assistant ID is required');
            return;
        }

        setIsLoading(true);
        setIsError(false);
        setResponse('Loading...');
        onLog(`Gateway: ${description}`);

        try {
            const result = await onGateway(messages);
            setResponse(result.answer);
            onLog('Gateway response received');
        } catch (err) {
            setIsError(true);
            setResponse(`Error: ${err}`);
            onLog(`ERROR: Gateway failed - ${err}`);
        } finally {
            setIsLoading(false);
        }
    };

    const testText = () => {
        const messages: AIGatewayMessage[] = [
            {
                role: 'user',
                content: [{ type: 'text', text: 'Hello, what can you do?' }],
            },
        ];
        callGateway(messages, 'Array content test');
    };

    const testStringContent = () => {
        const messages: AIGatewayMessage[] = [
            {
                role: 'user',
                content: 'Hello, what can you do?', // Simple string instead of array
            },
        ];
        callGateway(messages, 'String content test');
    };

    const testImage = () => {
        const url = imageUrl.trim() || DEFAULT_IMAGE_URL;
        const messages: AIGatewayMessage[] = [
            {
                role: 'user',
                content: [
                    { type: 'text', text: "what's in this image?" },
                    { type: 'image_url', image_url: { url } },
                ],
            },
        ];
        callGateway(messages, 'Image recognition test');
    };

    const testConversation = () => {
        const messages: AIGatewayMessage[] = [
            {
                role: 'developer',
                content: [{ type: 'text', text: 'You are a helpful math tutor.' }],
            },
            {
                role: 'user',
                content: [{ type: 'text', text: 'What is 2+2?' }],
            },
            {
                role: 'assistant',
                content: [{ type: 'text', text: '2+2 equals 4.' }],
            },
            {
                role: 'user',
                content: [{ type: 'text', text: 'And what is that multiplied by 3?' }],
            },
        ];
        callGateway(messages, 'Multi-turn conversation test');
    };

    const sendCustom = () => {
        const text = message.trim();
        if (!text) {
            onLog('ERROR: Please enter a message');
            return;
        }

        const content: AIGatewayMessage['content'] = [{ type: 'text', text }];

        const url = imageUrl.trim();
        if (url) {
            content.push({ type: 'image_url', image_url: { url } });
        }

        const messages: AIGatewayMessage[] = [{ role: 'user', content }];
        callGateway(messages, `Custom message${url ? ' with image' : ''}`);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            onLog('ERROR: Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            onLog('ERROR: Image too large (max 5MB)');
            return;
        }

        onLog(`Uploading image: ${file.name} (${Math.round(file.size / 1024)} KB)`);

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64Url = e.target?.result as string;
            setImageUrl(base64Url);
            setPreviewUrl(base64Url);
            onLog('Image converted to base64 data URI');
        };
        reader.onerror = () => {
            onLog('ERROR: Failed to read image file');
        };
        reader.readAsDataURL(file);
    };

    const clearImage = () => {
        setImageUrl(DEFAULT_IMAGE_URL);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onLog('Image cleared, restored default URL');
    };

    return (
        <div>
            <h3 className="section-title">QB.ai.gateway()</h3>
            <p className="section-description">
                Multimodal AI: text + images, OpenAI-compatible format
            </p>

            <div className="button-group">
                <strong>Quick Tests:</strong>
                <button className="btn btn-small btn-primary" onClick={testText} disabled={isLoading}>
                    Array Content
                </button>
                <button className="btn btn-small btn-primary" onClick={testStringContent} disabled={isLoading}>
                    String Content
                </button>
                <button className="btn btn-small btn-primary" onClick={testImage} disabled={isLoading}>
                    Image Recognition
                </button>
                <button className="btn btn-small btn-primary" onClick={testConversation} disabled={isLoading}>
                    Multi-turn
                </button>
            </div>

            <hr className="divider" />

            <div className="form-group">
                <label>Custom Message</label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your message..."
                />
            </div>

            <div className="image-upload-row">
                <div className="form-group">
                    <label>Image URL (optional)</label>
                    <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => {
                            setImageUrl(e.target.value);
                            setPreviewUrl(null);
                        }}
                        placeholder="https://example.com/image.jpg"
                    />
                </div>
                <div className="file-input-wrapper">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        id="imageUpload"
                    />
                    <label htmlFor="imageUpload" className="file-input-label">
                        Upload
                    </label>
                </div>
            </div>

            {previewUrl && (
                <div className="image-preview">
                    <img src={previewUrl} alt="Preview" />
                    <button className="btn btn-flat" onClick={clearImage}>
                        Clear
                    </button>
                </div>
            )}

            <button className="btn btn-primary" onClick={sendCustom} disabled={isLoading}>
                Send to Gateway
            </button>

            <div className="response-section">
                <h4>Response:</h4>
                <div className={`response-box ${isLoading ? 'loading' : ''} ${isError ? 'error' : ''}`}>
                    {response}
                </div>
            </div>
        </div>
    );
};
