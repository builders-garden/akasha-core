import React, { SyntheticEvent, useEffect, useMemo, useState } from 'react';
import * as z from 'zod';
import { Controller, useWatch } from 'react-hook-form';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import TextField from '@akashaorg/design-system-core/lib/components/TextField';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Divider from '@akashaorg/design-system-core/lib/components/Divider';
import DropDown from '@akashaorg/design-system-core/lib/components/Dropdown';
import { apply, tw } from '@twind/core';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ButtonType } from '../types/common.types';
import { Licenses } from '../AppCreationForm';
import { ContactInfo } from './ContactInfo';
import { AkashaProfile, Image } from '@akashaorg/typings/lib/ui';
import { Collaborators } from './Collaborators';
import Icon from '@akashaorg/design-system-core/lib/components/Icon';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import AutoComplete from '@akashaorg/design-system-core/lib/components/AutoComplete';

const MAX_TAGS = 4;

export enum FieldName {
  license = 'license',
  licenseOther = 'licenseOther',
  contributors = 'contributors',
  contactInfo = 'contactInfo',
  keywords = 'keywords',
}

export type ExtensionEditStep3FormValues = {
  license?: string;
  licenseOther?: string;
  contributors?: string[];
  contactInfo?: string[];
  keywords?: string[];
};

export type ExtensionEditStep3FormProps = {
  licenseFieldLabel?: string;
  licenseOtherPlaceholderLabel?: string;
  collaboratorsFieldLabel?: string;
  collaboratorsDescriptionLabel?: string;
  collaboratorsSearchPlaceholderLabel?: string;
  extensionContributorsLabel: string;
  contactInfoFieldLabel?: string;
  contactInfoDescriptionLabel?: string;
  contactInfoPlaceholderLabel?: string;
  addLabel?: string;
  tagsLabel?: string;
  tagsDescriptionLabel?: string;
  addTagsPlaceholderLabel?: string;
  tagsAddedLabel?: string;
  noteLabel?: string;
  noteDescriptionLabel?: string;
  defaultValues?: ExtensionEditStep3FormValues;
  handleGetFollowingProfiles?: (query: string) => void;
  followingProfiles?: AkashaProfile[];
  allFollowingProfiles?: AkashaProfile[];
  cancelButton: ButtonType;
  nextButton: {
    label: string;
    handleClick: (data: ExtensionEditStep3FormValues) => void;
  };
  transformSource: (src: Image) => Image;
};

const ExtensionEditStep3Form: React.FC<ExtensionEditStep3FormProps> = props => {
  const {
    defaultValues = {
      license: '',
      licenseOther: '',
      contributors: [],
      contactInfo: [],
      keywords: [],
    },
    handleGetFollowingProfiles,
    followingProfiles,
    allFollowingProfiles,
    transformSource,
    cancelButton,
    nextButton,
    licenseFieldLabel,
    licenseOtherPlaceholderLabel,
    contactInfoFieldLabel,
    contactInfoDescriptionLabel,
    collaboratorsFieldLabel,
    collaboratorsDescriptionLabel,
    collaboratorsSearchPlaceholderLabel,
    extensionContributorsLabel,
    addLabel,
    tagsLabel,
    addTagsPlaceholderLabel,
    tagsDescriptionLabel,
    tagsAddedLabel,
    noteLabel,
    noteDescriptionLabel,
  } = props;

  const {
    control,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<ExtensionEditStep3FormValues>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const licenses: Licenses | string[] = [
    Licenses.MIT,
    Licenses.GPL,
    Licenses.APACHE,
    Licenses.BSD,
    Licenses.MPL,
    Licenses.OTHER,
  ];

  const isValid = !Object.keys(errors).length;

  const licenseValue = useWatch({ control, name: FieldName.license });

  // TODO: this works with one exception, if the user unfollows one of the original contributors
  // it will not hydrate the form values with it
  // to fix this a list of original contributor profiles needs to be passed as prop
  const defaultContributorProfiles = useMemo(() => {
    return (
      defaultValues.contributors
        ?.map(contributorDID => {
          return allFollowingProfiles?.find(
            followingProfile => followingProfile.did.id === contributorDID,
          );
        })
        .filter(profile => profile?.id) || []
    );
  }, [defaultValues.contributors, allFollowingProfiles]);

  const [addedContributors, setAddedContributors] = useState<AkashaProfile[]>(
    defaultContributorProfiles || [],
  );

  useEffect(() => {
    setAddedContributors(defaultContributorProfiles);
  }, [defaultContributorProfiles]);

  const [query, setQuery] = useState('');
  const [keywords, setKeywords] = useState(new Set(defaultValues.keywords));

  const maxTagsSelected = keywords.size >= MAX_TAGS;

  //@TODO: here it should be a list of available indexed keywords for extensions
  const availableKeywords = [];

  const onSave = (event: SyntheticEvent) => {
    event.preventDefault();
    const formValues = getValues();

    formValues.contributors = addedContributors?.map(profile => profile.did?.id);
    formValues.keywords = [...keywords]?.filter(keyword => keyword);

    if (formValues.license === Licenses.OTHER) {
      formValues.license = formValues.licenseOther;
    }
    if (isValid) {
      nextButton.handleClick({
        ...formValues,
        contactInfo: formValues.contactInfo?.filter(link => link),
      });
    }
  };

  return (
    <form onSubmit={onSave} className={tw(apply`h-full`)}>
      <Stack direction="column" spacing="gap-y-4">
        <Stack padding="px-4 pb-16" spacing="gap-y-4">
          <Controller
            control={control}
            name={FieldName.license}
            render={({ field: { name, value, onChange } }) => (
              <DropDown
                label={licenseFieldLabel}
                name={name}
                selected={value}
                menuItems={licenses}
                setSelected={onChange}
                required={true}
              />
            )}
            defaultValue={
              licenses.includes(defaultValues.license) ? defaultValues.license : Licenses.OTHER
            }
          />
          {licenseValue === Licenses.OTHER && (
            <Controller
              control={control}
              name={FieldName.licenseOther}
              render={({ field: { name, value, onChange, ref }, fieldState: { error } }) => (
                <TextField
                  id={name}
                  customStyle="mt-2"
                  value={value}
                  placeholder={licenseOtherPlaceholderLabel}
                  type={'text'}
                  caption={error?.message}
                  status={error?.message ? 'error' : null}
                  onChange={onChange}
                  inputRef={ref}
                  required={true}
                />
              )}
              defaultValue={licenses.includes(defaultValues.license) ? '' : defaultValues.license}
            />
          )}
          <Divider />
          <Collaborators
            addedContributors={addedContributors}
            setAddedContributors={setAddedContributors}
            contributors={followingProfiles}
            handleGetContributors={handleGetFollowingProfiles}
            contributorsFieldLabel={collaboratorsFieldLabel}
            contributorsDescriptionLabel={collaboratorsDescriptionLabel}
            contributorsSearchPlaceholderLabel={collaboratorsSearchPlaceholderLabel}
            extensionContributorsLabel={extensionContributorsLabel}
            addButtonLabel={addLabel}
            transformSource={transformSource}
          />
          <Divider />
          <ContactInfo
            contactLabel={contactInfoFieldLabel}
            description={contactInfoDescriptionLabel}
            addButtonLabel={addLabel}
            control={control}
            contactInfo={defaultValues.contactInfo || ['']}
            onDeleteInfoField={async () => {
              await trigger();
            }}
          />
          <Divider />
          <Stack direction="column" spacing="gap-2">
            <Text variant="h6">{tagsLabel}</Text>
            <Text variant="subtitle2" color={{ light: 'grey4', dark: 'grey6' }} weight="light">
              {tagsDescriptionLabel}
            </Text>
            <AutoComplete
              value={query}
              options={availableKeywords}
              placeholder={addTagsPlaceholderLabel}
              tags={keywords}
              separators={['Comma', 'Space', 'Enter']}
              customStyle="grow mt-2"
              onSelected={({ index }) => {
                setKeywords(prev => prev.add(availableKeywords[index]));
                setQuery('');
              }}
              onChange={value => {
                if (typeof value === 'string') {
                  setQuery(value);
                  return;
                }
                setKeywords(new Set(value));
              }}
              disabled={maxTagsSelected}
              multiple
            />
            <Text variant="subtitle2" color={{ light: 'grey4', dark: 'grey6' }} weight="light">
              {`${keywords.size}/${MAX_TAGS} ${tagsAddedLabel}`}
            </Text>
          </Stack>
          <Divider />
          <Stack direction="column" spacing="gap-2">
            <Stack direction="row" align="center" spacing="gap-x-1">
              <Icon
                icon={<ExclamationTriangleIcon />}
                size="sm"
                color={{ light: 'warningLight', dark: 'warningDark' }}
              />
              <Text variant="button-md">{noteLabel}</Text>
            </Stack>
            <Text variant="body2" color={{ light: 'grey4', dark: 'grey6' }} weight="light">
              {noteDescriptionLabel}
            </Text>
          </Stack>
        </Stack>
        <Divider />

        <Stack direction="row" justify="end" spacing="gap-x-2" customStyle="px-4 pb-4">
          <Button
            variant="text"
            label={cancelButton.label}
            onClick={cancelButton.handleClick}
            disabled={cancelButton.disabled}
          />
          <Button
            variant="primary"
            label={nextButton.label}
            disabled={!isValid}
            onClick={onSave}
            type="submit"
          />
        </Stack>
      </Stack>
    </form>
  );
};

export default ExtensionEditStep3Form;

const schema = z.object({
  extensionLicense: z.string(),
  contactInfo: z.array(
    z
      .union([
        z.string().email({ message: 'Email or URL is required' }),
        z.string().url({ message: 'Email or URL is required' }),
        z.string().length(0),
      ])
      .optional()
      .transform(e => (e === '' ? undefined : e)),
  ),
});
