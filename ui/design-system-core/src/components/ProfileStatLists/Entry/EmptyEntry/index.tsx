import React, { ReactNode } from 'react';
import InfoCard from '../../../InfoCard';

export type EmptyEntryProps = {
  titleLabel?: ReactNode;
  subTitleLabel?: ReactNode;
  type?: 'following' | 'followers';
  userName?: string;
  viewerIsOwner?: boolean;
};

const EmptyEntry: React.FC<EmptyEntryProps> = ({
  titleLabel,
  subTitleLabel,
  type = 'followers',
  userName = 'user',
  viewerIsOwner = true,
}) => {
  if (!viewerIsOwner && type === 'following')
    return <InfoCard titleLabel={`@${userName} is not following anyone yet!`} />;

  let props = {
    titleLabel: titleLabel ? titleLabel : 'Looks like there are no followers!',
    subTitleLabel: subTitleLabel ? (
      subTitleLabel
    ) : (
      <>
        Interacting with people on AKASHA&apos;s
        <br /> Apps will help get followers!
      </>
    ),
  };

  if (type === 'following') {
    props = {
      titleLabel: titleLabel ? titleLabel : 'You are not following anyone yet!',
      subTitleLabel: subTitleLabel ? (
        subTitleLabel
      ) : (
        <>
          By following others, will help you see interesting
          <br /> content written and shared by them!
        </>
      ),
    };
  }

  return <InfoCard {...props} />;
};

export default EmptyEntry;
