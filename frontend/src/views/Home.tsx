import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import injectSheet, { WithSheet } from 'react-jss';
import { Link } from 'react-router-dom';
import CardSubtitle from 'reactstrap/lib/CardSubtitle';
import CardText from 'reactstrap/lib/CardText';
import IziviContent from '../layout/IziviContent';
import { Theme } from '../layout/theme';
import { ApiStore } from '../stores/apiStore';
import createStyles from '../utilities/createStyles';

const styles = (theme: Theme) =>
  createStyles({
    page: {
      '& p': {
        textAlign: 'justify',
      },
      '& ul': {
        paddingLeft: 2 * theme.layout.baseSpacing,
        paddingRight: 2 * theme.layout.baseSpacing,
        textAlign: 'justify',
      },
    },
  });

interface Props extends WithSheet<typeof styles> {
  apiStore?: ApiStore;
}

@inject('apiStore')
@observer
class HomeInner extends React.Component<Props> {
  getRegisterLink = () => {
    return (
      <Link to={'/register/1'}>
        <FormattedMessage
          id="view.home.register"
          defaultMessage="registrieren"
        />
      </Link>
    );
  }

  getLoginLink = () => {
    return (
      <Link to={'/login'}>
        <FormattedMessage
          id="view.home.login"
          defaultMessage="anmelden"
        />
      </Link>
    );
  }

  getTitle = () => {
    return <span style={{ fontSize: '3rem', fontWeight: 'bold' }}>iZivi</span>;
  }

  render() {
    const { classes } = this.props;
    return (
      <IziviContent className={classes.page} card showBackgroundImage>
        <CardSubtitle>
          <FormattedMessage
            id="view.home.izivi_title"
            defaultMessage="{title} ist ein Tool der SWO zur Erfassung und Planung von Zivildienst-Einsätzen"
            values={{ title: this.getTitle() }}
          />
        </CardSubtitle>
        <CardText>
          <FormattedMessage
            id="view.home.intro"
            defaultMessage="Seit 1996 können Militärpflichtige, die den Militärdienst aus Gewissensgründen ablehnen, einen zivilen Ersatzdienst leisten. Die SWO hat den Zivildienst mitgestaltet und bietet Zivildienstleistenden eine Vielzahl von sinnvollen Einsatzmöglichkeiten zugunsten einer nachhaltigen Entwicklung."
          />
        </CardText>
        {this.props.apiStore!.isLoggedIn || (
          <>
            <CardText>
              <FormattedMessage
                id="view.home.register_info"
                defaultMessage="Bist du das erste Mal bei uns und möchtest einen Einsatz planen? Dann kannst du dich über folgenden Link {registerLink}"
                values={{ registerLink: this.getRegisterLink() }}
              />
            </CardText>
            <CardText>
              <FormattedMessage
                id="view.home.login_info"
                defaultMessage="Falls du uns bereits bekannt bist, kannst du dich hier {loginLink}"
                values={{ loginLink: this.getLoginLink() }}
              />
            </CardText>
          </>
        )}
      </IziviContent>
    );
  }
}

export const Home = injectSheet(styles)(HomeInner);
