export interface ICoreServices {
    express: string;
    mongodb: string;
}

export interface IHealth {
    status: string;
    timestamp: Date;
    uptime: number;
    services: ICoreServices;
}