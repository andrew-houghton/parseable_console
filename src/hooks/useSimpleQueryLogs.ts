import { SortOrder, type Log, type LogsQuery, type LogsSearch } from '@/@types/parseable/api/query';
import { getQueryLogs } from '@/api/query';
import { StatusCodes } from 'http-status-codes';
import useMountedState from './useMountedState';
import { useCallback, useMemo, useRef } from 'react';
import { parseLogData } from '@/utils';

export const useSimpleQueryLogs = () => {
    // data ref will always have the unfiltered data.
    // Only mutate it when data is fetched, otherwise read only

    const _dataRef = useRef<Log[] | null>(null);

    const [error, setError] = useMountedState<string | null>(null);
    const [loading, setLoading] = useMountedState<boolean>(false);
    const [querySearch, setQuerySearch] = useMountedState<LogsSearch>({
        search: '',
        filters: {},
        sort: {
            field: 'p_timestamp',
            order: SortOrder.DESCENDING,
        },
    });

    const data: Log[] | null = useMemo(() => {
        if (_dataRef.current) {
            const logs = _dataRef.current;
            const temp = [];
            const { search, filters, sort } = querySearch;
            const searchText = search.trim().toLowerCase();
            const filteredKeys = Object.keys(filters);

            mainLoop: for (const log of logs) {
                if (filteredKeys.length) {
                    const isFiltered = filteredKeys.every((x) => {
                        const logValue = log[x];
                        return logValue && filters[x].includes(logValue.toString());
                    });

                    if (!isFiltered) {
                        continue;
                    }
                }

                if (searchText) {
                    for (const key in log) {
                        const logValue = parseLogData(log[key], key);
                        if (logValue?.toString().toLowerCase().includes(searchText)) {
                            temp.push(log);
                            continue mainLoop;
                        }
                    }
                } else {
                    temp.push(log);
                }
            }

            const { field, order } = sort;

            temp.sort(({ [field]: aData }, { [field]: bData }) => {
                let res = 0;
                if (aData === bData) res = 0;
                else if (aData === null) res = -1;
                else if (bData === null) res = 1;
                else res = aData > bData ? 1 : -1;

                return res * order;
            });

            return temp;
        }

        return null;
    }, [_dataRef.current, querySearch]);

    const getColumnFilters = useCallback(
        (columnName: string) => {
            const logs = _dataRef.current;

            if (logs) {
                const temp = [];
                for (let i = 0; i < logs.length; i++) {
                    const columnValue = logs[i][columnName];
                    if (columnValue) {
                        temp.push(columnValue);
                    }
                }
                return [...new Set(temp)];
            }

            return null;
        },
        [_dataRef.current],
    );

    const getQueryData = async (logsQuery: LogsQuery) => {
        try {
            setLoading(true);
            setError(null);

            const logsQueryRes = await getQueryLogs(logsQuery);

            const data = logsQueryRes.data;

            if (logsQueryRes.status === StatusCodes.OK) {
                _dataRef.current = data;
                return;
            }
            if (typeof data === 'string' && data.includes('Stream is not initialized yet')) {
                _dataRef.current = [];
                return;
            }
            setError('Failed to query log');
        } catch {
            setError('Failed to query log');
        } finally {
            setLoading(false);
        }
    };

    const resetData = () => {
        _dataRef.current = null;
        setError(null);
    };

    return {
        data,
        setQuerySearch,
        getColumnFilters,
        sort: querySearch.sort,
        error,
        loading,
        getQueryData,
        resetData,
    };
};