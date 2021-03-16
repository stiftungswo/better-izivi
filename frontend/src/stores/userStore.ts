import debounce from 'lodash.debounce';
import { action, computed, observable, reaction } from 'mobx';
import moment from 'moment';
import { User, UserFilter, UserOverview } from '../types';
import { DomainStore } from './domainStore';
import { MainStore } from './mainStore';

export class UserStore extends DomainStore<User, UserOverview> {
  protected get entityName() {
    return {
      singular: this.mainStore.intl.formatMessage({
        id: 'store.userStore.user.one',
        defaultMessage: 'Der Benutzer',
      }),
      plural: this.mainStore.intl.formatMessage({
        id: 'store.userStore.user.other',
        defaultMessage: 'Die Benutzer',
      }),
    };
  }

  @computed
  get entities(): UserOverview[] {
    return this.users;
  }

  set entities(users: UserOverview[]) {
    this.users = users;
  }

  @computed
  get entity(): User | undefined {
    return this.user;
  }

  set entity(holiday: User | undefined) {
    this.user = holiday;
  }

  @observable
  users: UserOverview[] = [];

  @observable
  user?: User;

  @observable
  userFilters: UserFilter;

  filter = debounce(() => {
    const max_items = this.userFilters.no_keywords? this.userFilters.items : '1000000'
    this.fetchUsers(max_items, this.userFilters.site).then(() => {
    this.filteredEntities = this.users.filter((user: UserOverview) => {
        const { zdp, name, beginning, ending, active, role } = this.userFilters;
        switch (true) {
          case zdp && !user.zdp.toString().startsWith(zdp.toString()):
          case name && !user.full_name.toLowerCase().includes(name.toLowerCase()):
          case beginning && user.beginning && moment(user.beginning).isBefore(moment(beginning)):
          case ending && user.ending && moment(user.ending).isAfter(moment(ending)):
          case active && !user.active:
            return false;
          default:
            return !(role && user.role !== role);
        }
      }).sort((leftUser: UserOverview, rightUser: UserOverview) => {
        if (!leftUser.beginning && rightUser.beginning) {
          return 1;
        }
        if (!rightUser.beginning && leftUser.beginning) {
          return -1;
        }
        if (!rightUser.beginning || !leftUser.beginning) {
          return 0;
        }
        return moment(leftUser.beginning).isBefore(rightUser.beginning) ? 1 : -1;
      });
  })}, 100);

  protected entityURL = '/users/';
  protected entitiesURL = '/users/';

  constructor(mainStore: MainStore) {
    super(mainStore);
    this.userFilters = observable.object({
      zdp: '',
      name: '',
      beginning: moment()
        .subtract(1, 'year')
        .date(0)
        .format('Y-MM-DD'),
      ending: moment()
        .add(5, 'year')
        .date(0)
        .format('Y-MM-DD'),
      active: false,
      role: '',
      items: '200',
      no_keywords: true,
      site: '1',
      button_deactive: false,
    });

    reaction(
      () => [
        this.userFilters.zdp,
        this.userFilters.name,
        this.userFilters.beginning,
        this.userFilters.ending,
        this.userFilters.active,
        this.userFilters.role,
        this.userFilters.items,
        this.userFilters.no_keywords,
        this.userFilters.site,
        this.userFilters.button_deactive,
      ],
      this.filter,
    );
  }

  @action
  updateFilters(updates: Partial<UserFilter>) {
    this.userFilters = { ...this.userFilters, ...updates };
  }
  @action
  async fetchUsers(nr_items: string, site: string) {
    try {
      const res = await this.mainStore.api.get<UserOverview[]>('/users', { params: { items: nr_items, site: site } });
      if (res.data.length === parseInt(nr_items)){
          this.userFilters.button_deactive = true
      }
      else if (res.data.length === (parseInt(nr_items) + 1)) {
          this.userFilters.button_deactive = false
          res.data.splice(-1, 1)
      }
      else if (res.data.length < parseInt(nr_items)){
          this.userFilters.button_deactive = true
      }
      this.users = res.data
      } catch(e) {
        this.mainStore.displayError(
          this.mainStore.intl.formatMessage(
            {
              id: 'store.domainStore.not_loaded.other',
              defaultMessage: '{entityNamePlural} konnten nicht geladen werden.',
            },
            { entityNamePlural: this.entityName.plural },
          ));
        console.error(e);
        throw e;
      }
  }
}

