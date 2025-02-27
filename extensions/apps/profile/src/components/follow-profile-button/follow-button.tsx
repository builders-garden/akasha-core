import React from 'react';
import getSDK from '@akashaorg/core-sdk';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import DuplexButton from '@akashaorg/design-system-core/lib/components/DuplexButton';
import { Following } from '@akashaorg/design-system-core/lib/components/Icon/akasha-icons';
import {
  CheckIcon,
  UserPlusIcon,
  XMarkIcon,
} from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';
import { useTranslation } from 'react-i18next';
import {
  IModalNavigationOptions,
  NotificationEvents,
  NotificationTypes,
} from '@akashaorg/typings/lib/ui';
import { useRootComponentProps } from '@akashaorg/ui-awf-hooks';
import {
  useCreateFollowMutation,
  useUpdateFollowMutation,
} from '@akashaorg/ui-awf-hooks/lib/generated/apollo';

type FollowButtonProps = {
  profileID: string;
  followDocumentId: string;
  iconOnly: boolean;
  isFollowing: boolean;
  isLoggedIn: boolean;
  showLoginModal: (redirectTo?: { modal: IModalNavigationOptions }) => void;
};
export const FollowButton = ({
  profileID,
  followDocumentId,
  iconOnly,
  isFollowing,
  isLoggedIn,
  showLoginModal,
}: FollowButtonProps) => {
  const { t } = useTranslation('app-profile');
  const { uiEvents } = useRootComponentProps();
  const sdk = getSDK();

  const sendSuccessNotification = (profileName: string, following: boolean) => {
    uiEvents.next({
      event: NotificationEvents.ShowNotification,
      data: {
        type: NotificationTypes.Success,
        title: t('{{message}} {{name}}', {
          message: following ? 'You are now following' : 'You are no longer following',
          name: profileName,
        }),
      },
    });
  };

  const [createFollowMutation, { loading: createFollowLoading }] = useCreateFollowMutation({
    context: { source: sdk.services.gql.contextSources.composeDB },
    onCompleted: async ({ setAkashaFollow }) => {
      const document = setAkashaFollow.document;
      if (iconOnly) sendSuccessNotification(document.profile?.name, isFollowing);
    },
  });

  const [updateFollowMutation, { loading: updateFollowLoading }] = useUpdateFollowMutation({
    context: { source: sdk.services.gql.contextSources.composeDB },
    onCompleted: async ({ updateAkashaFollow }) => {
      const document = updateAkashaFollow.document;
      if (iconOnly) sendSuccessNotification(document.profile?.name, isFollowing);
    },
  });

  const loading = createFollowLoading || updateFollowLoading;

  const disableActions = !profileID;
  const disabledStyle = disableActions ? 'opacity-50' : '';

  const handleFollow = (profileID: string, followId: string, isFollowing: boolean) => {
    if (disableActions) {
      return;
    }
    if (!isLoggedIn) {
      return showLoginModal();
    }
    if (!followId) {
      createFollowMutation({
        variables: { i: { content: { isFollowing, profileID } } },
      });
    } else {
      updateFollowMutation({
        variables: {
          i: {
            id: followId,
            content: {
              isFollowing,
            },
          },
        },
      });
    }
  };

  return iconOnly ? (
    <Button
      aria-label="follow"
      onClick={() => handleFollow(profileID, followDocumentId, !isFollowing)}
      icon={isFollowing ? <Following role="img" aria-label="following" /> : <UserPlusIcon />}
      variant={'primary'}
      loading={loading}
      greyBg={true}
      iconOnly={true}
      customStyle={disabledStyle}
    />
  ) : (
    <DuplexButton
      inactiveLabel={t('Follow')}
      activeLabel={t('Following')}
      activeHoverLabel={t('Unfollow')}
      active={isFollowing}
      iconDirection="left"
      activeIcon={<CheckIcon />}
      activeHoverIcon={<XMarkIcon />}
      inactiveVariant="secondary"
      loading={loading}
      fixedWidth={'w-[7rem]'}
      hoverColors={{
        background: { light: 'transparent', dark: 'transparent' },
        border: { light: 'errorLight', dark: 'errorDark' },
        text: { light: 'errorLight', dark: 'errorDark' },
        icon: { light: 'errorLight', dark: 'errorDark' },
      }}
      customStyle={disabledStyle}
      onClickInactive={() => handleFollow(profileID, followDocumentId, !isFollowing)}
      onClickActive={() => handleFollow(profileID, followDocumentId, !isFollowing)}
    />
  );
};
