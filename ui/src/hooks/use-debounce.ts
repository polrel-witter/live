import { useEffect } from "react";

// thanks
// https://dev.to/bwca/create-a-debounce-function-from-scratch-in-typescript-560m
export function debounce<A = unknown, R = void>(
    fn: (args: A) => R,
    ms: number
): [(args: A) => Promise<R>, () => void] {
    let timer: NodeJS.Timeout;

    const debouncedFunc = (args: A): Promise<R> =>
        new Promise((resolve) => {
            if (timer) {
                clearTimeout(timer);
            }

            timer = setTimeout(() => {
                resolve(fn(args));
            }, ms);
        });

    const teardown = () => clearTimeout(timer);

    return [debouncedFunc, teardown];
}

export const useDebounce = <A = unknown, R = void>(
    fn: (args: A) => R,
    ms: number
): ((args: A) => Promise<R>) => {
    const [debouncedFun, teardown] = debounce<A, R>(fn, ms);

    useEffect(() => () => teardown(), []);

    return debouncedFun;
};
