import { Mixed, TypeOf } from 'technoidentity-utils';
export declare const defaultOptions: {
    integer: {
        min: number;
        max: number;
    };
    floating: {
        min: number;
        max: number;
        fixed: number;
    };
    sentence: {
        words: number;
    };
    array: {
        minLength: number;
        maxLength: number;
    };
};
export declare type FakeOptions = typeof defaultOptions;
export declare function fake<T extends Mixed>(spec: T, options?: FakeOptions): TypeOf<typeof spec>;
//# sourceMappingURL=fake.d.ts.map