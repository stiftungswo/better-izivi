import { toJS } from 'mobx';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { MainStore } from '../../stores/mainStore';
import { UserStore } from '../../stores/userStore';
import { FormValues, User } from '../../types';
import { UserForm } from './UserForm';

interface UserDetailRouterProps {
  id?: string;
}

interface Props extends RouteComponentProps<UserDetailRouterProps> {
  userStore?: UserStore;
  mainStore?: MainStore;
  userId?: number;
}

@inject('userStore', 'mainStore')
@observer
export class UserUpdate extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

    props.userStore!.fetchOne(
      props.userId ? props.userId : Number(props.match.params.id),
    );
  }

  handleSubmit = (user: User) => {
    return this.props.userStore!.put(user);
  }

  get user() {
    const user = this.props.userStore!.entity;
    if (user) {
      return toJS(user);
      // it's important to detach the mobx proxy before passing it into formik
      // formik's deepClone can fall into endless recursions with those proxies.
    } else {
      return undefined;
    }
  }

  render() {
    const intl = this.props.mainStore!.intl;
    const user = this.user;

    return (
      <UserForm
        onSubmit={this.handleSubmit}
        user={user as FormValues}
        title={
          user
            ? intl.formatMessage({
              id: 'layout.navigation.profile',
              defaultMessage: 'Profil',
            })
            : intl.formatMessage({
              id: 'views.users.userUpdate.profile_is_loading',
              defaultMessage: 'Profil wird geladen',
            })
        }
      />
    );
  }
}
