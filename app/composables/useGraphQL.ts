import type { WatchSource } from 'vue'

interface AsyncQueryParams {
    operation: string
    variables?: Record<string, unknown>
    options?: {
        watch?: WatchSource[]
    }
}

export const useAsyncQuery = (params: string | AsyncQueryParams) => {
    return useAsyncGql(params as any)
}

export const executeQuery = async <T = any>(operation: string, variables?: Record<string, unknown>): Promise<T> => {
    const client = useGql()
    return (client as any)[operation](variables) as T
}
