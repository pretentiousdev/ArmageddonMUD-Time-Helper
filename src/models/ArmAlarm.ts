export interface ArmAlarm {
    id: number;
    timestamp: Date;
    title: string;
    body: string;
    timeout: (null | number);
}