declare module 'react-native-html-to-pdf' {
    export interface Pdf {
        filePath?: string;
        base64?: string;
    }

    export interface Options {
        html: string;
        fileName: string;
        directory?: string;
        base64?: boolean;
        height?: number;
        width?: number;
        padding?: number;
        bgColor?: string;
    }

    export default class RNHTMLtoPDF {
        static convert(options: Options): Promise<Pdf>;
    }
}

