import React from 'react';
import Link from '@akashaorg/design-system-core/lib/components/Link';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import VibesValueCard from './value-card';

type VibesValue = {
  path: string;
  title: string;
  assetName: string;
  description: string;
};
export interface VibesValuesCardProps {
  titleLabel: string;
  subtitleLabel: string;
  ctaLabel: string;
  ctaUrl: string;
  values: VibesValue[];
  onValueClick: (path: VibesValue['path']) => () => void;
}

/**
 * Component used in the vibes app to present the community values for moderation
 */
const VibesValuesCard: React.FC<VibesValuesCardProps> = props => {
  const { titleLabel, subtitleLabel, ctaLabel, ctaUrl, values, onValueClick } = props;

  return (
    <Card padding={16}>
      <Stack spacing="gap-y-4">
        <Text variant="h5">{titleLabel}</Text>

        <Text variant="subtitle2">{subtitleLabel}</Text>
        <Stack customStyle="grid gap-4 grid-cols-2 md:grid-cols-3">
          {values.map((value, idx) => (
            <VibesValueCard
              key={value.title + idx}
              isMini={true}
              label={value.title}
              assetName={value.assetName}
              onClick={onValueClick(value.path)}
            />
          ))}

          <Link
            to={ctaUrl}
            customStyle="flex md:hidden text-sm text-center font-bold no-underline text(secondaryLight dark:secondaryDark)"
            target="_blank"
          >
            <Stack
              padding="p-3"
              align="center"
              justify="center"
              fullWidth={true}
              customStyle="h-32 bg(grey9 dark:grey3) rounded-2xl cursor-pointer"
            >
              <Text
                variant="footnotes1"
                align="center"
                color={{
                  light: 'secondaryLight',
                  dark: 'secondaryDark',
                }}
                weight="bold"
              >
                {ctaLabel}
              </Text>
            </Stack>
          </Link>
        </Stack>
        {ctaLabel && (
          <Stack
            justify="center"
            padding="p-5"
            customStyle="hidden md:flex bg(grey9 dark:grey3) rounded-2xl cursor-pointer"
          >
            <Link
              to={ctaUrl}
              customStyle="text-sm text-center font-bold no-underline text(secondaryLight dark:secondaryDark)"
              target="_blank"
            >
              {ctaLabel}
            </Link>
          </Stack>
        )}
      </Stack>
    </Card>
  );
};

export default VibesValuesCard;
