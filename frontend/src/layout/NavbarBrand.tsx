import * as React from 'react';
import { default as NavbarBrandBase } from 'reactstrap/lib/NavbarBrand';
import AppMode from '../utilities/AppMode';

export class NavbarBrand extends React.Component<{appMode: AppMode}> {
  render() {
    return (
        <NavbarBrandBase href={'/'}>
          {this.props.appMode.isProd ? 'iZivi' : 'iZivi - Development'}
        </NavbarBrandBase>
    );
  }
}
