import {DefaultTheme} from "quickblox-react-ui-kit";

export default class CustomTheme extends DefaultTheme {
    divider = (): string => '#E7EFFF';
    mainText = (): string => '#0B121B';
    fontFamily = (): string => 'Roboto';
    //
    caption = (): string => '#90979F';
    chatInput = (): string => '#F7F9FF';
    disabledElements = (): string => '#BCC1C5';
    dropdownBackground = (): string => '#FFFFFF';
    error = (): string => '#FF3B30';
    fieldBorder = (): string => '#90979F';
    hightlight = (): string => '#FFFDC1';
    incomingBackground = (): string => '#E4E6E8';
    inputElements = (): string => '#202F3E';
    mainBackground = (): string => '#FFFFFF';
    mainElements = (): string => '#3978FC';
    outgoingBackground = (): string => '#E7EFFF';
    secondaryBackground = (): string => '#FFFFFF';
    secondaryElements = (): string => '#202F3E';
    secondaryText = (): string => '#636D78';
}
