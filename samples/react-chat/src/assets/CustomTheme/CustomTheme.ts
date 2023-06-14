import {DefaultTheme} from "quickblox-react-ui-kit";

export default class CustomTheme extends DefaultTheme {
    // eslint-disable-next-line class-methods-use-this
    divider = (): string => '#E7EFFF';
    // eslint-disable-next-line class-methods-use-this
    mainText = (): string => '#0B121B';
    // eslint-disable-next-line class-methods-use-this'
    fontFamily = (): string => 'Roboto';
    //
    // eslint-disable-next-line class-methods-use-this
    caption = (): string => '#90979F';
    // eslint-disable-next-line class-methods-use-this
    chatInput = (): string => '#F7F9FF';
    // eslint-disable-next-line class-methods-use-this
    disabledElements = (): string => '#BCC1C5';
    // eslint-disable-next-line class-methods-use-this
    dropdownBackground = (): string => '#FFFFFF';
    // eslint-disable-next-line class-methods-use-this
    error = (): string => '#FF3B30';
    // eslint-disable-next-line class-methods-use-this
    fieldBorder = (): string => '#90979F';
    // eslint-disable-next-line class-methods-use-this
    hightlight = (): string => '#FFFDC1';
    // eslint-disable-next-line class-methods-use-this
    incomingBackground = (): string => '#E4E6E8';
    // eslint-disable-next-line class-methods-use-this
    inputElements = (): string => '#202F3E';
    // eslint-disable-next-line class-methods-use-this
    mainBackground = (): string => '#FFFFFF';
    // eslint-disable-next-line class-methods-use-this
    mainElements = (): string => '#3978FC';
    // eslint-disable-next-line class-methods-use-this
    outgoingBackground = (): string => '#E7EFFF';
    // eslint-disable-next-line class-methods-use-this
    secondaryBackground = (): string => '#FFFFFF';
    // eslint-disable-next-line class-methods-use-this
    secondaryElements = (): string => '#202F3E';
    // eslint-disable-next-line class-methods-use-this
    secondaryText = (): string => '#636D78';
}
