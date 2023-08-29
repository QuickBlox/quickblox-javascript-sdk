import { useState } from 'react';
import {AIMessageWidget, AISource, AIWidgetIcon, ErrorMessageIcon, IChatMessage} from "quickblox-react-ui-kit";

interface MessageWidgetProps {
    servername: string;
    api: string;
    port: string;
    sessionToken: string;
}
export default function UseDefaultAIAssistAnswerWidget({
                                                           servername,
                                                           api,
                                                           port,
                                                           sessionToken,
                                                       }: MessageWidgetProps): AIMessageWidget {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [errorMessage, setErrorMessage] = useState<string>('');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
    const fileToWidget = (file: File, context: IChatMessage[]): void => {};

    const renderWidget = (): JSX.Element => {
        if (errorMessage && errorMessage.length > 0) {
            const errorsDescriptions:
                | { title: string; action: () => void }[]
                | undefined = [];

            return (
                <ErrorMessageIcon
                    errorMessageText={errorMessage}
                    errorsDescriptions={errorsDescriptions}
                />
            );
        }

        return <AIWidgetIcon applyZoom color="green" />;
    };

    const [textFromWidgetToContent, setTextFromWidgetToContent] = useState('');

    const textToWidget = async (
        textToSend: string,
        context: IChatMessage[],
    ): Promise<string> => {
        if (textToSend && textToSend.length > 0) {
            const prompt = `You are a customer support chat operator. Your goal is to provide helpful and informative responses to customer inquiries. Give a response to the next user's query, considering the entire conversation context, and use grammar and vocabulary at the A2-B2 level. Answer in the format of simple sentences. Do not include question in answer. Please, provide answer for this issue:"${textToSend}"`;

            // eslint-disable-next-line no-return-await
            return await AISource.getData(
                prompt,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                context,
                servername,
                api,
                port,
                sessionToken,
            ).then((data) => {
                setTextFromWidgetToContent(data);

                return data;
            });
        }

        return '';
    };

    return {
        textToContent: textFromWidgetToContent,
        renderWidget,
        textToWidget,
    };
}
