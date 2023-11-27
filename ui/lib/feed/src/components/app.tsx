import React from 'react';
import ReflectFeed from './reflect-feed';
import BeamFeed, { BeamFeedProps } from './beam-feed';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import { I18nextProvider } from 'react-i18next';
import { EntityTypes, Profile } from '@akashaorg/typings/lib/ui';
import { ScrollStateDBWrapper } from '../utils/scroll-state-db';
import { useRootComponentProps } from '@akashaorg/ui-awf-hooks';

/**
 * Scroll restoration:
 * start from the first item that was visible in the viewport (firstItemCursor)
 *  - if first time visitor - start from most recent item
 * fetch \{ overscan \} number of items that were published \{ before \} the first item in the list
 *  - first item in the list (startItemCursor) is different from the (firstItemCursor)
 *  - if there are items in the response, show the "New items" pill
 *    - on click - reset the list including the new items
 */

export type FeedWidgetCommonProps = {
  queryKey: string;
  loggedProfileData?: Profile;
  itemSpacing: BeamFeedProps['itemSpacing'];
  contentClickable?: boolean;
  accentBorderTop?: boolean;
  scrollerOptions?: { overscan: number };
  newItemsPublishedLabel: string;
  trackEvent?: BeamFeedProps['trackEvent'];
  onNavigate: BeamFeedProps['onNavigate'];
  onLoginModalOpen: BeamFeedProps['onLoginModalOpen'];
  onEntryFlag: BeamFeedProps['onEntryFlag'];
  onEntryRemove: BeamFeedProps['onEntryRemove'];
} & (
  | { itemType: EntityTypes.BEAM }
  | {
      itemType: EntityTypes.REFLECT;
      reflectionsOf:
        | { beamId: string; itemType: EntityTypes.BEAM }
        | { reflectionId: string; itemType: EntityTypes.REFLECT };
    }
);

const FeedWidgetRoot: React.FC<FeedWidgetCommonProps> = props => {
  const { getTranslationPlugin, layoutConfig } = useRootComponentProps();
  const { i18n } = getTranslationPlugin();

  const db = React.useMemo(() => {
    return new ScrollStateDBWrapper('scroll-state');
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      {props.itemType === EntityTypes.BEAM && (
        <BeamFeed {...props} i18n={i18n} modalSlotId={layoutConfig.modalSlotId} db={db} />
      )}
      {props.itemType === EntityTypes.REFLECT && (
        <ReflectFeed
          {...props}
          reflectionsOf={
            props.reflectionsOf.itemType === EntityTypes.BEAM
              ? { entryId: props.reflectionsOf.beamId, itemType: EntityTypes.BEAM }
              : { entryId: props.reflectionsOf.reflectionId, itemType: EntityTypes.REFLECT }
          }
          i18n={i18n}
          modalSlotId={layoutConfig.modalSlotId}
          db={db}
        />
      )}
      <Stack id="edit-reflect-error-snackbar-container" customStyle="sticky bottom-2" fullWidth />
    </I18nextProvider>
  );
};

export default FeedWidgetRoot;
