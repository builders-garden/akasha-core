import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import GardenApp from './app';

const reactLifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: GardenApp,
  errorBoundary: (error, errorInfo, props) => {
    if (props.logger) {
      props.logger.error(`${JSON.stringify(error)}, ${errorInfo}`);
    }
    throw 'Something went wrong';
  },
});

export const bootstrap = reactLifecycles.bootstrap;

export const mount = reactLifecycles.mount;

export const unmount = reactLifecycles.unmount;
