import logoInvert from '@/assets/images/nyan-cat.gif';
import { HOME_ROUTE } from '@/constants/routes';
import { HEADER_HEIGHT } from '@/constants/theme';
import type { HeaderProps as MantineHeaderProps } from '@mantine/core';
import { Box, Button, Image, Header as MantineHeader, Tooltip } from '@mantine/core';
import { FC } from 'react';
import { useHeaderStyles } from './styles';

type PrimaryHeaderProps = Omit<MantineHeaderProps, 'children' | 'height' | 'className'>;

const PrimaryHeader: FC<PrimaryHeaderProps> = (props) => {
	const { classes } = useHeaderStyles();
	const { container, logoContainer, navContainer, imageSty, actionBtn } = classes;

	return (
		<MantineHeader {...props} className={container} height={HEADER_HEIGHT} p={0} withBorder>
			<Box className={logoContainer}>
				<a href={HOME_ROUTE} style={{margin: '16px'}}>
					<Image className={imageSty} src={logoInvert} height={160} alt="Parseable Logo" />
				</a>
			</Box>
		</MantineHeader>
	);
};

export default PrimaryHeader;
