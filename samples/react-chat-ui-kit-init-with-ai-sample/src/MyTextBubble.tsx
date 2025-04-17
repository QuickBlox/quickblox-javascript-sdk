// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
    HighLightLink,
    messageHasUrls,
} from 'quickblox-react-ui-kit';
import './TextBubble.scss';

interface TextBubbleProps {
    text: string;
    translatedText?: string;
    type: 'outgoing' | 'incoming';
}

export default function TextBubble({ text, translatedText, type }: TextBubbleProps) {
    return (
        <div className={`text-bubble-background__${type}`}>
            <div className="bubble-content-text">
                {messageHasUrls(text) ? <HighLightLink messageText={text} /> : text}
                {
                    translatedText && translatedText.length > 0 && (
                        <div className="translated-text">
                            {translatedText}
                        </div>
                    )
                }
            </div>
        </div>
    );
}
