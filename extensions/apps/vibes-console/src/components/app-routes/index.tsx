import React from 'react';
import {
  Outlet,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router';
import { ICreateRouter, IRouterContext } from '@akashaorg/typings/lib/ui';
import ErrorComponent from './error-component';
import {
  Applications,
  ApplicationDetailPage,
  ApplicationsLog,
  BecomeModerator,
  Dashboard,
  EditMaxApplicants,
  MyApplications,
  SelfApplicationDetailPage,
  Settings,
  WithdrawApplicationPage,
  AssignAdminPage,
  RespondAdminPage,
  ResignRolePage,
  ResignConfirmationPage,
  ReviewItemPage,
  ItemReportsPage,
} from '../../pages';
import routes, {
  APPLICATIONS,
  APPLICATION_DETAIL,
  BECOME_MODERATOR,
  EDIT_MAX_MODERATORS,
  HOME,
  MY_APPLICATIONS,
  MY_APPLICATION_DETAIL,
  DASHBOARD,
  SETTINGS,
  WITHDRAW_APPLICATION,
  ASSIGN_ADMIN,
  RESPOND_ADMIN,
  RESIGN_MODERATOR,
  RESIGN_CONFIRMATION,
  baseDashboardUrl,
} from '../../routes';

const rootRoute = createRootRouteWithContext<IRouterContext>()({
  component: Outlet,
});

const defaultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: routes[HOME], replace: true });
  },
});

const applicationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes[HOME],
  component: () => {
    return <Applications />;
  },
});

const becomeModeratorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes[BECOME_MODERATOR],
  component: () => {
    return <BecomeModerator />;
  },
});

const selfApplicationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes[MY_APPLICATIONS],
  component: () => {
    return <MyApplications />;
  },
});

const selfApplicationDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes[MY_APPLICATION_DETAIL],
  component: () => {
    return <SelfApplicationDetailPage />;
  },
});

const selfApplicationWithdrawRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes[WITHDRAW_APPLICATION],
  component: () => {
    return <WithdrawApplicationPage />;
  },
});

const applicationsLogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes[APPLICATIONS],
  component: () => {
    return <ApplicationsLog />;
  },
});

const applicationDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes[APPLICATION_DETAIL],
  component: () => {
    return <ApplicationDetailPage />;
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes[DASHBOARD],
  component: () => {
    return <Dashboard />;
  },
});

const viewItemReportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `${baseDashboardUrl}/item/$id/reports`,
  component: () => {
    const { id } = viewItemReportsRoute.useParams();
    return <ItemReportsPage id={id} />;
  },
});

const viewItemReportFlagsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `${baseDashboardUrl}/item/$id/reports/$reportId`,
  component: () => {
    const { id, reportId } = viewItemReportFlagsRoute.useParams();
    return <ItemReportsPage id={id} reportId={reportId} />;
  },
});

const reviewItemRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `${baseDashboardUrl}/$action/$itemType/$id`,
  component: () => {
    const { action, itemType, id } = reviewItemRoute.useParams();
    return <ReviewItemPage action={action} itemType={itemType} id={id} />;
  },
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes[SETTINGS],
  component: () => {
    return <Settings />;
  },
});

const editMaxApplicantsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes[EDIT_MAX_MODERATORS],
  component: () => {
    return <EditMaxApplicants />;
  },
});

const assignAdminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes[ASSIGN_ADMIN],
  component: () => {
    return <AssignAdminPage />;
  },
});

const respondAdminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes[RESPOND_ADMIN],
  component: () => {
    return <RespondAdminPage />;
  },
});

const resignModeratorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes[RESIGN_MODERATOR],
  component: () => {
    return <ResignRolePage />;
  },
});

const resignConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes[RESIGN_CONFIRMATION],
  component: () => {
    return <ResignConfirmationPage />;
  },
});

const routeTree = rootRoute.addChildren([
  defaultRoute,
  applicationsRoute.addChildren([
    becomeModeratorRoute,
    selfApplicationsRoute,
    selfApplicationDetailRoute,
    selfApplicationWithdrawRoute,
    applicationsLogRoute,
    applicationDetailRoute,
  ]),
  dashboardRoute.addChildren([
    viewItemReportsRoute,
    viewItemReportFlagsRoute,
    reviewItemRoute,
    settingsRoute,
    editMaxApplicantsRoute,
    assignAdminRoute,
    respondAdminRoute,
    resignModeratorRoute,
    resignConfirmationRoute,
  ]),
]);

export const router = ({ baseRouteName, apolloClient }: ICreateRouter) =>
  createRouter({
    routeTree,
    basepath: baseRouteName,
    context: {
      apolloClient,
    },
    defaultErrorComponent: ({ error }) => (
      <ErrorComponent error={(error as unknown as Error).message} />
    ),
  });
