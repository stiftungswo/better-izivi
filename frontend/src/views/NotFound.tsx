import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import IziviContent from '../layout/IziviContent';

export class NotFound extends React.Component {

  getLink = () => {
    return (
      <Link to={'/'}>
        <FormattedMessage
          id="izivi.frontend.views.notFound.here"
          defaultMessage="Hier"
        />
      </Link>
    );
  }

  render() {
    return (
      <IziviContent card showBackgroundImage title={'Seite nicht gefunden'}>
        <p>
          <FormattedMessage
            id="izivi.frontend.views.notFound.not_found"
            defaultMessage="Die angeforderte Seite konnte nicht gefunden werden. {link} geht es zurück zur Startseite."
            values={{ link: this.getLink() }}
          />
        </p>
      </IziviContent>
    );
  }
}
