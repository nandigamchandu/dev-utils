import { AnyObj } from 'technoidentity-utils';
interface ResourceConfig {
    readonly spec: AnyObj;
    readonly name: string;
    readonly count: number;
}
export declare function startFakeJSONServer(resources: readonly ResourceConfig[], port?: string | number): void;
export {};
//# sourceMappingURL=fakeServer.d.ts.map