import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { hasOwn, useAkashaStore, useRootComponentProps } from '@akashaorg/ui-awf-hooks';
import {
  useGetIndexedStreamCountQuery,
  useGetInterestsByDidQuery,
  useCreateInterestsMutation,
  useUpdateInterestsMutation,
} from '@akashaorg/ui-awf-hooks/lib/generated/apollo';
import { AkashaIndexedStreamStreamType } from '@akashaorg/typings/lib/sdk/graphql-types-new';
import { BeamContentResolver, getNsfwFiltersForTagFeed, TagFeed } from '@akashaorg/ui-lib-feed';
import { ModalNavigationOptions } from '@akashaorg/typings/lib/ui';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import getSDK from '@akashaorg/awf-sdk';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import TagProfileCard from '@akashaorg/design-system-components/lib/components/TagProfileCard';
import TagFeedHeaderLoader from './tag-feed-header-loader';
import ScrollTopWrapper from '@akashaorg/design-system-core/lib/components/ScrollTopWrapper';
import ScrollTopButton from '@akashaorg/design-system-core/lib/components/ScrollTopButton';
import InfoCard from '@akashaorg/design-system-core/lib/components/InfoCard';

type TagFeedPageProps = {
  tagName: string;
};

const TagFeedPage: React.FC<TagFeedPageProps> = props => {
  const { tagName } = props;
  const { t } = useTranslation('app-antenna');
  const {
    data: { authenticatedDID },
  } = useAkashaStore();
  const { navigateToModal, worldConfig } = useRootComponentProps();
  const isLoggedIn = !!authenticatedDID;
  const _navigateToModal = React.useRef(navigateToModal);
  const showLoginModal = React.useCallback(
    (redirectTo?: { modal: ModalNavigationOptions }, message?: string) => {
      _navigateToModal.current?.({
        name: 'login',
        redirectTo,
        message,
      });
    },
    [],
  );

  const sdk = React.useRef(getSDK());
  const tagFilters = useMemo(
    () => [
      { where: { streamType: { equalTo: AkashaIndexedStreamStreamType.Beam } } },
      { where: { indexType: { equalTo: sdk.current.services.gql.labelTypes.TAG } } },
      { where: { indexValue: { equalTo: tagName } } },
      { where: { active: { equalTo: true } } },
    ],
    [tagName],
  );
  const {
    data: beamCountData,
    loading: loadingCount,
    error: countQueryError,
  } = useGetIndexedStreamCountQuery({
    variables: {
      indexer: sdk.current.services.gql.indexingDID,
      filters: {
        and: tagFilters,
      },
    },
  });

  const beamCount = useMemo(() => {
    return beamCountData && hasOwn(beamCountData.node, 'akashaIndexedStreamListCount')
      ? beamCountData.node.akashaIndexedStreamListCount
      : 0;
  }, [beamCountData]);

  // fetch user's interest subscription

  const { data: tagSubscriptionsData, refetch: refetchTagSubscriptions } =
    useGetInterestsByDidQuery({
      variables: { id: authenticatedDID },
      skip: !isLoggedIn,
    });

  const tagSubscriptions = useMemo(() => {
    if (!isLoggedIn) return null;
    return tagSubscriptionsData &&
      hasOwn(tagSubscriptionsData.node, 'akashaProfileInterests') &&
      tagSubscriptionsData.node.akashaProfileInterests?.topics.length > 0
      ? tagSubscriptionsData.node.akashaProfileInterests?.topics.map(topic => topic.value)
      : [];
  }, [isLoggedIn, tagSubscriptionsData]);

  const tagSubscriptionsId = useMemo(() => {
    if (!isLoggedIn) return null;
    return tagSubscriptionsData && hasOwn(tagSubscriptionsData.node, 'akashaProfileInterests')
      ? tagSubscriptionsData.node.akashaProfileInterests?.id
      : null;
  }, [isLoggedIn, tagSubscriptionsData]);

  const [createInterestsMutation, { loading }] = useCreateInterestsMutation({
    context: { source: sdk.current.services.gql.contextSources.composeDB },
  });

  const [updateInterestsMutation, { loading: updateLoading }] = useUpdateInterestsMutation({
    context: { source: sdk.current.services.gql.contextSources.composeDB },
  });

  const executeInterestsMutation = (interests: string[]) => {
    if (tagSubscriptionsId) {
      updateInterestsMutation({
        variables: {
          i: {
            id: tagSubscriptionsId,
            content: {
              topics: [...new Set(interests)].map(tag => ({
                value: tag,
                labelType: sdk.current.services.gql.labelTypes.INTEREST,
              })),
            },
          },
        },
        onError: () => {
          refetchTagSubscriptions();
        },
      });
    } else {
      createInterestsMutation({
        variables: {
          i: {
            content: {
              topics: [...new Set(tagSubscriptions)].map(tag => ({
                value: tag,
                labelType: sdk.current.services.gql.labelTypes.INTEREST,
              })),
            },
          },
        },
        onError: () => {
          refetchTagSubscriptions();
        },
      });
    }
  };

  const handleTagSubscribe = (tagName: string) => {
    if (!isLoggedIn) {
      showLoginModal();
      return;
    }
    const newInterests = [...tagSubscriptions, tagName];
    executeInterestsMutation(newInterests);
  };

  const handleTagUnsubscribe = (tagName: string) => {
    if (!isLoggedIn) {
      showLoginModal();
      return;
    }
    const newInterests = tagSubscriptions.filter(topic => topic !== tagName);
    executeInterestsMutation(newInterests);
  };

  const listOfTags = React.useMemo(() => [tagName], [tagName]);

  const queryKey = `app-antenna_tag-antenna_${tagName}`;

  return (
    <HelmetProvider>
      <Stack fullWidth={true}>
        <Helmet>
          <title>{worldConfig.title}</title>
        </Helmet>
        {loadingCount && <TagFeedHeaderLoader />}
        {countQueryError && (
          <ErrorLoader
            type="script-error"
            title={t('Error loading tag data')}
            details={countQueryError?.message}
          />
        )}
        {!loadingCount && (
          <Stack customStyle="mb-2">
            <TagProfileCard
              tag={{
                name: tagName,
                totalPosts: beamCount,
              }}
              subscribedTags={tagSubscriptions}
              isLoading={loading || updateLoading}
              mentionsLabel={beamCount + (beamCount > 1 ? ' Beams' : ' Beam')}
              handleSubscribeTag={() => handleTagSubscribe(tagName)}
              handleUnsubscribeTag={() => handleTagUnsubscribe(tagName)}
            />
          </Stack>
        )}
        {beamCount === 0 && (
          <Stack customStyle="mt-8">
            <InfoCard
              titleLabel={
                <>
                  {t('There is no content found for the ')}
                  {t('{{topic}}', { topic: listOfTags.length > 1 ? 'topics' : 'topic' })}{' '}
                  {listOfTags.map(tag => (
                    <span key={tag}>#{tag} </span>
                  ))}
                </>
              }
              bodyLabel={
                <>
                  {t('Be the first one to create a beam for this topic')}
                  {'! 🚀'}
                </>
              }
              bodyVariant="body1"
              assetName="longbeam-notfound"
            />
          </Stack>
        )}
        {beamCount > 0 && (
          <TagFeed
            dataTestId="tag-feed"
            tags={listOfTags}
            estimatedHeight={150}
            itemSpacing={8}
            filters={{
              and: [
                ...tagFilters,
                {
                  or: getNsfwFiltersForTagFeed({
                    isLoggedIn,
                    showNsfw: false,
                    queryKey,
                  }),
                },
              ],
            }}
            scrollOptions={{ overScan: 10 }}
            scrollTopIndicator={(listRect, onScrollToTop) => (
              <ScrollTopWrapper placement={listRect.left}>
                <ScrollTopButton hide={false} onClick={onScrollToTop} />
              </ScrollTopWrapper>
            )}
            renderItem={itemData => <BeamContentResolver beamId={itemData.stream} />}
          />
        )}
      </Stack>
    </HelmetProvider>
  );
};

export default TagFeedPage;
