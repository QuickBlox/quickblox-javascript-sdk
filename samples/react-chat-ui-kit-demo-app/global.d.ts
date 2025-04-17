declare module "*.svg" {
    import React from "react";
    const content: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
    export default content;
}

declare module "*.svg?react" {
    import React from "react";
    const content: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
    export default content;
}

declare module "*.svg?url" {
    const content: string;
    export default content;
}
