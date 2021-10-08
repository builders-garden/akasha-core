import * as React from 'react';
import singleSpaReact from 'single-spa-react';
import ReactDOM from 'react-dom';
import { RootComponentProps } from '@akashaproject/ui-awf-typings';
import DS from '@akashaproject/design-system';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { withProviders } from '@akashaproject/ui-awf-hooks';
import i18n, { setupI18next } from '../i18n';

const { Box, Button, ModalContainer, ModalCard } = DS;

const LoginModal = (props: RootComponentProps) => {
  const { t } = useTranslation();
  const location = useLocation();

  const handleModalClose = () => {
    props.singleSpa.navigateToUrl(location.pathname);
  };

  const handleSignInClick = () => {
    props.navigateToModal({ name: 'signin', redirectTo: props.activeModal.redirectTo });
  };

  const handleSignUpClick = () => {
    props.navigateToModal({ name: 'signup', redirectTo: props.activeModal.redirectTo });
  };

  return (
    <ModalContainer onModalClose={handleModalClose}>
      <ModalCard>
        <Box
          direction="row"
          align="center"
          gap="small"
          fill="horizontal"
          pad={{ horizontal: 'xlarge', vertical: 'medium' }}
        >
          <Button onClick={handleSignInClick} label={t('Sign In')} fill="horizontal" />
          <Button
            primary={true}
            onClick={handleSignUpClick}
            label={t('Sign Up')}
            fill="horizontal"
          />
        </Box>
      </ModalCard>
    </ModalContainer>
  );
};

const Wrapped = (props: RootComponentProps) => (
  <Router>
    <React.Suspense fallback={<></>}>
      <I18nextProvider i18n={i18n}>
        <LoginModal {...props} />
      </I18nextProvider>
    </React.Suspense>
  </Router>
);

const reactLifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: withProviders(Wrapped),
  errorBoundary: (err, errorInfo, props: RootComponentProps) => {
    if (props.logger) {
      props.logger.error(`${JSON.stringify(err)}, ${errorInfo}`);
    }
    return <div>!</div>;
  },
});

export const bootstrap = (props: RootComponentProps) => {
  return setupI18next({
    logger: props.logger,
    // must be the same as the one in ../../i18next.parser.config.js
    namespace: 'ui-plugin-profile',
  });
};

export const mount = reactLifecycles.mount;

export const unmount = reactLifecycles.unmount;
