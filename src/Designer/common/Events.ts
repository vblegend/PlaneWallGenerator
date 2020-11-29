export enum Events{


    /**
     * 渲染
     */
    RENDER = 1,

    GRAPHIC_UPDATE = 2,


}

/**
 * 6应用程序事件回调委托
 */
export type EventCallBack = ((value: any) => void) | ((value: any,value2:any) => void);