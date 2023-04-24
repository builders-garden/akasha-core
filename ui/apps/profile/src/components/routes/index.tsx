import * as React from 'react';
import Index from '../pages';
import NoProfileFound from '../pages/no-profile-found';
import menuRoute, { EDIT, ENGAGEMENT } from '../../routes';
import DS from '@akashaorg/design-system';
import { useTranslation } from 'react-i18next';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { RootComponentProps, ModalNavigationOptions } from '@akashaorg/typings/ui';
import { useGetLogin, useGetProfile } from '@akashaorg/ui-awf-hooks';

const { Box } = DS;

const AppRoutes: React.FC<RootComponentProps> = props => {
  const { plugins } = props;

  const loginQuery = useGetLogin();
  const loggedProfileQuery = useGetProfile(loginQuery.data?.pubKey);

  const { t } = useTranslation('app-profile');

  const showLoginModal = (redirectTo?: { modal: ModalNavigationOptions }) => {
    props.navigateToModal({ name: 'login', redirectTo });
  };

  const handleGoToFeedClick = () => {
    plugins['@akashaorg/app-routing']?.routing.navigateTo({
      appName: '@akashaorg/app-akasha-integration',
      getNavigationUrl: (routes: Record<string, string>) => routes.defaultRoute,
    });
  };

  const handleCTAClick = () => {
    // if user is logged in, show link to their profile
    if (loggedProfileQuery.data?.pubKey) {
      return plugins['@akashaorg/app-routing']?.routing.navigateTo({
        appName: '@akashaorg/app-profile',
        getNavigationUrl: (routes: Record<string, string>) => routes.myProfile,
      });
    }
    // if guest, show link to auth app
    plugins['@akashaorg/app-routing']?.routing.navigateTo?.({
      appName: '@akashaorg/app-auth-ewa',
      getNavigationUrl: (routes: Record<string, string>) => routes.Connect,
    });
  };

  return (
    <Router basename={props.baseRouteName}>
      <Box>
        <Routes>
          <Route path="/">
            <Route
              path={':pubKey'}
              element={
                <Index
                  {...props}
                  loginState={loginQuery.data}
                  loggedProfileData={loggedProfileQuery.data}
                />
              }
            />
            <Route
              path={`:pubKey${menuRoute[ENGAGEMENT]}`}
              element={
                <Index
                  {...props}
                  loginState={loginQuery.data}
                  loggedProfileData={loggedProfileQuery.data}
                  pageType="engagement"
                />
              }
            />
            <Route
              path={`:pubKey${menuRoute[EDIT]}`}
              element={
                <Index
                  {...props}
                  loginState={loginQuery.data}
                  loggedProfileData={loggedProfileQuery.data}
                  pageType="edit"
                />
              }
            />

            <Route
              element={
                <NoProfileFound
                  titleLabel={t("Etherean profile doesn't exist 😅")}
                  subtitleLine1Label={t("You can check Ethereum World's")}
                  subtitleLine2Label={t('or')}
                  cta1Label={t('Feed')}
                  cta2Label={
                    loggedProfileQuery.data?.pubKey ? t('visit your profile') : t('log in')
                  }
                  onGoToFeedClick={handleGoToFeedClick}
                  onCTAClick={handleCTAClick}
                />
              }
            />
          </Route>
        </Routes>
      </Box>
    </Router>
  );
};

export default AppRoutes;
