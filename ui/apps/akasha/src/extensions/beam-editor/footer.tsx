import * as React from 'react';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import { PlusIcon } from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';
import { uiState } from './beam-editor';

export interface FooterProps {
  uiState: uiState;
  handleBeamPublish: () => void;
  handleClickAddBlock: () => void;
  handleClickTags: () => void;
  handleAddTags: () => void;
  handleClickCancel: () => void;
  isPublishing?: boolean;
  disablePublishing?: boolean;
  tagsLabel?: string;
  publishLabel?: string;
  addLabel?: string;
  addBlockLabel?: string;
  cancelLabel?: string;
  blocksLabel?: string;
  blocksNumber?: number;
  tagsNumber?: number;
  tagValue?: string;
}

export const Footer: React.FC<FooterProps> = props => {
  const {
    uiState,
    handleAddTags,
    handleClickAddBlock,
    handleClickTags,
    handleBeamPublish,
    handleClickCancel,
    addLabel,
    addBlockLabel,
    tagsLabel,
    publishLabel,
    cancelLabel,
    blocksLabel,
    blocksNumber = 0,
    tagsNumber = 0,
    tagValue,
    isPublishing,
    disablePublishing,
  } = props;

  const renderContent = () => {
    switch (uiState) {
      case 'blocks':
        return (
          <>
            <Text>{`${blocksNumber}/10 ${blocksLabel}`}</Text>
            <Stack direction="row" spacing="gap-2">
              <Button variant="secondary" label={cancelLabel} onClick={handleClickCancel} />
            </Stack>
          </>
        );
      case 'tags':
        return (
          <>
            <Text>{`${tagsNumber}/10 ${tagsLabel}`}</Text>
            <Stack direction="row" spacing="gap-2">
              <Button variant="text" label={cancelLabel} onClick={handleClickCancel} />
              <Button
                variant="primary"
                disabled={isPublishing || tagValue.length < 1}
                label={addLabel}
                onClick={handleAddTags}
              />
            </Stack>
          </>
        );
      default:
        return (
          <>
            <Button
              onClick={handleClickAddBlock}
              icon={<PlusIcon />}
              iconDirection="left"
              variant="text"
              greyBg={true}
              label={addBlockLabel}
            />
            <Stack direction="row" spacing="gap-2">
              <Button variant="text" label={tagsLabel} onClick={handleClickTags} />
              <Button
                variant="primary"
                disabled={isPublishing || disablePublishing}
                label={publishLabel}
                onClick={handleBeamPublish}
              />
            </Stack>
          </>
        );
    }
  };

  return (
    <Stack
      padding={16}
      fullWidth
      justify="between"
      direction="row"
      customStyle="rounded-b-xl"
      background={{ light: 'white', dark: 'grey2' }}
    >
      {renderContent()}
    </Stack>
  );
};
