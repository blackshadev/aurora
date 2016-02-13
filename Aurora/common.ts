
export enum HttpVerb {
    GET,
    POST,
    PUT,
    DELETE
}


export interface IError {
    msg: string;
    type?: string;
}

export interface IHueError extends IError {
    hueType: number;
    hueAddress: string;
}
