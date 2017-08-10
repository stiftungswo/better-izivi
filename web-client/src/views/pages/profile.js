import Inferno from 'inferno';
import { Link } from 'inferno-router';

import Card from '../tags/card';
import InputField from '../tags/Profile/InputField';
import InputFieldWithHelpText from '../tags/Profile/InputFieldWithHelpText';
import InputCheckbox from '../tags/Profile/InputCheckbox';
import DatePicker from '../tags/DatePicker';
import Cantons from '../tags/Profile/Cantons';
import RegionalCenters from '../tags/Profile/RegionalCenters';
import Missions from '../tags/Profile/Missions';
import AdminRestrictedFields from '../tags/Profile/AdminRestrictedFields';
import axios from 'axios';
import Component from 'inferno-component';
import ApiService from '../../utils/api';
import LoadingView from '../tags/loading-view';
import Header from '../tags/header';
import Toast from '../../utils/toast';

export default class User extends Component {
  constructor(props, { router }) {
    super(props);

    this.state = {
      result: [],
      cantons: [],
      regianlCenters: [],
      specifications: [],
      lastDateValue: null,
      reportSheets: [],
    };

    this.cantonTag = new Cantons();
    this.regionalCenterTag = new RegionalCenters();
    this.adminFields = new AdminRestrictedFields();
    this.missionTag = new Missions();
    this.router = router;
  }

  componentDidMount() {
    this.getUser();
    this.cantonTag.getCantons(this);
    this.regionalCenterTag.getRegionalCenters(this);
    this.getSpecifications();
    this.getReportSheets();
    DatePicker.initializeDatePicker();
  }

  componentWillReceiveProps(nextProps) {
    this.props = nextProps;
    this.componentDidMount();
  }

  getUser() {
    this.setState({ loading: true, error: null });

    axios
      .get(ApiService.BASE_URL + 'user' + (this.props.params.userid ? '/' + this.props.params.userid : ''), {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('jwtToken') },
      })
      .then(response => {
        var newState = {
          result: response.data,
          loading: false,
          lastDateValue: response.data['birthday'],
        };
        for (var i = 0; i < response.data.missions.length; i++) {
          var key = response.data.missions[i].id;

          newState['result'][key + '_specification'] = response.data.missions[i].specification;
          newState['result'][key + '_start'] = response.data.missions[i].start;
          newState['result'][key + '_end'] = response.data.missions[i].end;
          newState['result'][key + '_first_time'] = response.data.missions[i].first_time;
          newState['result'][key + '_long_mission'] = response.data.missions[i].long_mission;
          newState['result'][key + '_probation_period'] = response.data.missions[i].probation_period;
        }

        this.setState(newState);

        for (var i = 0; i < response.data.missions.length; i++) {
          this.missionTag.getMissionDays(this, response.data.missions[i].id);
        }
      })
      .catch(error => {
        this.setState({ error: error });
      });
  }

  getSpecifications() {
    this.setState({ loading: true, error: null });

    axios
      .get(ApiService.BASE_URL + 'specification/me', { headers: { Authorization: 'Bearer ' + localStorage.getItem('jwtToken') } })
      .then(response => {
        this.setState({
          loading: false,
          specifications: response.data,
        });
      })
      .catch(error => {
        this.setState({ error: error });
      });
  }

  getReportSheets() {
    this.setState({ loading: true, error: null });

    let apiRoute = this.props.params.userid === undefined ? 'me' : this.props.params.userid;

    axios
      .get(ApiService.BASE_URL + 'reportsheet/user/' + apiRoute, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('jwtToken') },
      })
      .then(response => {
        this.setState({ loading: false, reportSheets: response.data });
      })
      .catch(error => {
        this.setState({ loading: false, error: error });
      });
  }

  handleChange(e) {
    let value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    this.state['result'][e.target.name] = value;
    this.setState(this.state);
  }

  handleDateChange(e, origin) {
    let value = e.target.value;

    if (value === undefined || value == null || value == '') {
      value = origin.state.lastDateValue;
    } else {
      value = DatePicker.dateFormat_CH2EN(value);
    }

    origin.state['result'][e.target.name] = value;
    origin.setState(this.state);
  }

  handleSelectChange(e) {
    var targetSelect = document.getElementById(e.target.id);
    let value = targetSelect.options[targetSelect.selectedIndex].value;
    this.state['result'][e.target.name] = value;
    this.setState(this.state);
  }

  handleTextareaChange(e) {
    let value = document.getElementById(e.target.id).value;
    this.state['result'][e.target.name] = value;
    this.setState(this.state);
  }

  handleIBANChange(e) {
    this.validateIBAN(e.target.value);
    return this.handleChange(e);
  }

  validateIBAN(value) {
    var regex = new RegExp('^CH\\d{2,2}\\s{0,1}(\\w{4,4}\\s{0,1}){4,7}\\w{0,2}$', 'g');

    if (regex.test(value)) {
      $('#ibanFormGroup').removeClass('has-warning');
    } else {
      $('#ibanFormGroup').addClass('has-warning');
    }
  }

  save() {
    let apiRoute = this.props.params.userid === undefined ? 'me' : this.props.params.userid;

    this.setState({ loading: true, error: null });
    axios
      .post(ApiService.BASE_URL + 'user/' + apiRoute, this.state.result, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('jwtToken') },
      })
      .then(response => {
        Toast.showSuccess('Speichern erfolgreich', 'Profil gespeichert');
        this.setState({ loading: false });
      })
      .catch(error => {
        this.setState({ loading: false });
        Toast.showError('Speichern fehlgeschlagen', 'Profil konnte nicht gespeichert werden', error, this.context);
      });
  }

  redirectToChangePassword(e) {
    this.router.push('/changePassword');
  }

  showReportSheet(id) {
    this.setState({ loading: true, error: null });
    axios
      .get(ApiService.BASE_URL + 'pdf/zivireportsheet?reportSheetId=' + id, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('jwtToken') },
        responseType: 'blob',
      })
      .then(response => {
        this.setState({ loading: false });
        let blob = new Blob([response.data], { type: 'application/pdf' });
        window.location = window.URL.createObjectURL(blob);
      })
      .catch(error => {
        this.setState({ loading: false, error: error });
      });
  }

  getPasswordChangeButton() {
    return (
      <div>
        <button type="button" name="resetPassword" class="btn btn-primary" onClick={e => this.redirectToChangePassword(e)}>
          Passwort ändern
        </button>
        <hr />
      </div>
    );
  }

  render() {
    let result = this.state.result;
    let howerText_IBAN = 'IBAN nummer';
    let howerText_Post = 'Postkonto Nummer';
    let howerText_Berufserfahrung =
      'Wir profitieren gerne von deiner Erfahrung. Wenn wir genau wissen, wann wer mit welchen Erfahrungen einen Einsatz tätigt, können wir z.T. Projekte speziell planen.';
    let howerText_health_insurance = 'Krankenkassen Name und Ort';

    var missions = this.missionTag.getMissions(this);

    return (
      <Header>
        <div className="page page__user_list">
          <Card>
            <h1>Profil</h1>
            <div class="container">
              <form
                class="form-horizontal"
                action="javascript:;"
                onSubmit={() => {
                  this.save();
                }}
              >
                <hr />
                {this.getPasswordChangeButton()}
                <input name="id" value="00000" type="hidden" />
                <input name="action" value="saveEmployee" type="hidden" />

                <h3>Persönliche Informationen</h3>
                <InputField id="zdp" label="ZDP" value={result.zdp} disabled="true" />
                <InputField id="first_name" label="Vorname" value={result.first_name} self={this} />
                <InputField id="last_name" label="Nachname" value={result.last_name} self={this} />

                <InputField id="address" label="Strasse" value={result.address} self={this} />
                <InputField id="city" label="Ort" value={result.city} self={this} />
                <InputField id="zip" label="PLZ" value={result.zip} self={this} />

                <DatePicker
                  id="birthday"
                  label="Geburtstag"
                  value={result.birthday}
                  callback={this.handleDateChange}
                  callbackOrigin={this}
                />

                <InputField id="hometown" label="Heimatort" value={result.hometown} self={this} />

                <InputField inputType="email" id="email" label="E-Mail" value={result.email} self={this} />
                <InputField inputType="tel" id="phone_mobile" label="Tel. Mobil" value={result.phone_mobile} self={this} />
                <InputField inputType="tel" id="phone_private" label="Tel. Privat" value={result.phone_private} self={this} />
                <InputField inputType="tel" id="phone_business" label="Tel. Geschäft" value={result.phone_business} self={this} />

                <div class="form-group">
                  <label class="control-label col-sm-3" for="canton">
                    Kanton
                  </label>
                  <div class="col-sm-9">
                    <select id="canton" name="canton" class="form-control" onChange={e => this.handleSelectChange(e)}>
                      {this.cantonTag.renderCantons(this.state)}
                    </select>
                  </div>
                </div>

                <hr />
                <h3>Bank-/Postverbindung</h3>

                <div class="form-group" id="ibanFormGroup">
                  <label class="control-label col-sm-3" for="hometown">
                    IBAN-Nr.
                  </label>
                  <div class="col-sm-8">
                    <input
                      type="text"
                      id="bank_iban"
                      name="bank_iban"
                      value={result.bank_iban}
                      className="form-control"
                      onChange={e => this.handleIBANChange(e)}
                    />
                  </div>
                  <div id="_helpiban" className="col-sm-1 hidden-xs">
                    <a href="#" data-toggle="popover" title="IBAN-Nr" data-content={howerText_IBAN}>
                      <span style="font-size:2em;" className="glyphicon glyphicon-question-sign" aria-hidden="true" />
                    </a>
                  </div>
                </div>

                <hr />
                <h3>Krankenkasse</h3>
                <div class="form-group" id="healthInsuranceFormGroup">
                  <label class="control-label col-sm-3" for="health_insurance">
                    Krankenkasse (Name und Ort)
                  </label>
                  <div class="col-sm-8">
                    <input
                      type="text"
                      id="health_insurance"
                      name="health_insurance"
                      value={result.health_insurance}
                      className="form-control"
                      onChange={e => this.handleIBANChange(e)}
                    />
                  </div>
                  <div id="_helpiban" className="col-sm-1 hidden-xs">
                    <a href="#" data-toggle="popover" title="Krankenkasse" data-content={howerText_health_insurance}>
                      <span style="font-size:2em;" className="glyphicon glyphicon-question-sign" aria-hidden="true" />
                    </a>
                  </div>
                </div>
                <hr />

                <h3>Diverse Informationen</h3>
                <div class="form-group">
                  <label class="control-label col-sm-3" for="berufserfahrung">
                    Berufserfahrung
                  </label>
                  <div class="col-sm-8">
                    <textarea
                      rows="4"
                      id="work_experience"
                      name="work_experience"
                      class="form-control"
                      onChange={e => this.handleTextareaChange(e)}
                    >
                      {result.work_experience}
                    </textarea>
                  </div>
                  <div id="_helpberufserfahrung" className="col-sm-1 hidden-xs">
                    <a href="#" data-toggle="popover" title="Berufserfahrung" data-content={howerText_Berufserfahrung}>
                      <span style="font-size:2em;" className="glyphicon glyphicon-question-sign" aria-hidden="true" />
                    </a>
                  </div>
                </div>

                <div class="form-group">
                  <label class="control-label col-sm-3" for="hometown">
                    Regionalzentrum
                  </label>
                  <div class="col-sm-9">
                    <select id="regional_center" name="regional_center" class="form-control" onChange={e => this.handleSelectChange(e)}>
                      {this.regionalCenterTag.renderRegionalCenters(this.state)}
                    </select>
                  </div>
                </div>

                <InputCheckbox id="driving_licence" value={result.driving_licence} label="Führerausweis" self={this} />
                <InputCheckbox id="ga_travelcard" value={result.ga_travelcard} label="GA" self={this} />
                <InputCheckbox id="half_fare_travelcard" value={result.half_fare_travelcard} label="Halbtax" self={this} />
                <InputField id="other_fare_network" label="Andere Abos" value={result.other_fare_network} self={this} />

                {ApiService.isAdmin() ? this.adminFields.getAdminRestrictedFields(this, result) : null}

                <button type="submit" class="btn btn-primary">
                  Absenden
                </button>
              </form>

              <hr />
              <h3>Zivieinsätze</h3>
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Pflichtenheft</th>
                    <th>Start</th>
                    <th>Ende</th>
                    <th />
                    <th />
                  </tr>
                </thead>
                <tbody>{missions}</tbody>
              </table>
              <button class="btn btn-primary" data-toggle="modal" data-target="#einsatzModal">
                Neue Einsatzplanung hinzufügen
              </button>
              {this.missionTag.renderMissions(this, null, ApiService.isAdmin())}

              <hr />
              <h3>Meldeblätter</h3>
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Von</th>
                    <th>Bis</th>
                    <th>Angerechnete Tage</th>
                    {ApiService.isAdmin() ? <th>Erledigt</th> : null}
                    <th />
                    {ApiService.isAdmin() ? <th /> : null}
                  </tr>
                </thead>
                <tbody>
                  {this.state.reportSheets.length
                    ? this.state.reportSheets.map(obj => (
                        <tr>
                          <td>{moment(obj.start, 'YYYY-MM-DD').format('DD.MM.YYYY')}</td>
                          <td>{moment(obj.end, 'YYYY-MM-DD').format('DD.MM.YYYY')}</td>
                          <td>{obj.days}</td>
                          {ApiService.isAdmin() ? obj.done === 1 ? <td>&#9989;</td> : <td /> : null}
                          <td>
                            <button name="showReportSheet" class="btn btn-xs" onClick={() => this.showReportSheet(obj.id)}>
                              Spesenrapport anzeigen
                            </button>
                          </td>
                          {ApiService.isAdmin() ? (
                            <td>
                              <button name="editReportSheet" class="btn btn-xs" onClick={() => this.router.push('/expense/' + obj.id)}>
                                Spesen bearbeiten
                              </button>
                            </td>
                          ) : null}
                        </tr>
                      ))
                    : null}
                </tbody>
              </table>
            </div>
          </Card>
          <LoadingView loading={this.state.loading} error={this.state.error} />
        </div>
      </Header>
    );
  }

  componentDidUpdate() {
    this.validateIBAN($('#bank_iban').val());
  }
}
