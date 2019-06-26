import { Formik } from 'formik';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import * as React from 'react';
import Button from 'reactstrap/lib/Button';
import { DatePickerInput } from '../../form/DatePickerField';
import { WiredField } from '../../form/formik';
import IziviContent from '../../layout/IziviContent';
import { MainStore } from '../../stores/mainStore';
import { UserFeedbackStore } from '../../stores/userFeedbackStore';
import { UserQuestionWithAnswers } from '../../types';
import {
  FeedbackTitle,
  Type1FeedbackGroup,
  Type3FeedbackGroup,
  Type4FeedbackGroup,
  Type5FeedbackGroup,
  Type6FeedbackGroup,
} from './FeedbackGroups';

interface Props {
  mainStore?: MainStore;
  userFeedbackStore?: UserFeedbackStore;
}

interface State {
  loading: boolean;
}

const initialValues = {
  beginning: moment()
    .subtract(1, 'year')
    .format('YYYY-MM-DD'),
  date_to: moment().format('YYYY-MM-DD'),
};

@inject('userFeedbackStore')
@observer
export class UserFeedbackOverview extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: true,
    };
  }

  componentDidMount(): void {
    this.updateData(initialValues);
  }

  updateData = (props: { beginning: string; date_to: string }) => {
    this.setState({ loading: true }, () => {
      this.props.userFeedbackStore!.fetchAll(props).then(() => this.setState({ loading: false }));
    });
  }

  render() {
    return (
      <IziviContent card title={'Einsatzfeedbacks'}>
        <Formik
          initialValues={{
            beginning: moment()
              .subtract(1, 'year')
              .toDate(),
            date_to: moment().toDate(),
          }}
          onSubmit={values => {
            const dateFrom = moment(values.beginning).format('YYYY-MM-DD');
            const dateTo = moment(values.date_to).format('YYYY-MM-DD');
            this.updateData({ beginning: dateFrom, date_to: dateTo });
          }}
          render={({ submitForm }) => (
            <>
              <WiredField horizontal component={DatePickerInput} name={'beginning'} label={'Von'} />
              <WiredField horizontal component={DatePickerInput} name={'date_to'} label={'Bis'} />

              <br />
              <Button onClick={() => submitForm()}>Antworten aktualisieren</Button>
            </>
          )}
        />

        <IziviContent loading={this.state.loading}>
          {' '}
          <br />
          {this.props.userFeedbackStore!.userFeedbacks.length > 0 &&
            this.props.userFeedbackStore!.userFeedbacks.map((feedback: UserQuestionWithAnswers) => {
              switch (feedback.type) {
                case 1:
                  return <Type1FeedbackGroup {...feedback} key={feedback.id} />;
                case 2:
                  return <FeedbackTitle {...feedback} key={feedback.id} />;
                case 3:
                  return <Type3FeedbackGroup {...feedback} key={feedback.id} />;
                case 4:
                  return <Type4FeedbackGroup {...feedback} key={feedback.id} />;
                case 5:
                  return <Type5FeedbackGroup {...feedback} key={feedback.id} />;
                case 6:
                  return <Type6FeedbackGroup {...feedback} key={feedback.id} />;
                default:
                  return `Type ${feedback.type} not yet covered`;
              }
            })}
        </IziviContent>
      </IziviContent>
    );
  }
}
