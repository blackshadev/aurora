
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

export type EventListener = ( source: Object, ...eventArgs ) => void;

/** Small interface to mitigate the fact that JavaScript doesn't 
 * have multiple inheritance and inheriting the EventEmitter class is a pain in the ass
 * More over, dear NodeJS developers, of you create an alias for the addListener function called `on` because you also have the `once`. 
 * Why the heck don't you go the extra mile and create a alias for the `removeListener` called `off`!?!
 */
export interface IEventEmitter {
    on(evt: string, listener: EventListener);
    off(evt: string, listener: EventListener);
    emit(evt: string, source: Object, ...args);
}