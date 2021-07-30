import * as React from 'react';
import AppMode from '../utilities/AppMode';
import { Navigation } from './Navigation';
import { CssBaseline } from './theme';

export class IziviLayout extends React.Component<{appMode: AppMode}> {
  render = () => (
    <div>
      <CssBaseline />
      <Navigation appMode={this.props.appMode} />
      {this.props.children}
    </div>
  )
}
