import { Box } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC } from 'react';
import LogTable from './LogTable';
import { useLogsStyles } from './styles';
import ViewLog from './ViewLog';

const BetterLogs: FC = () => {
	useDocumentTitle('Parseable | Better Logs');

	const { classes } = useLogsStyles();
	const { container } = classes;

	return (
		<Box className={container}>
			<LogTable />
			<ViewLog />
		</Box>
	);
};

export default BetterLogs;
