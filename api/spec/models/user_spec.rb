# frozen_string_literal: true

require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'validations' do
    subject(:model) { described_class.new }

    it { is_expected.to validate_numericality_of(:zip).only_integer }

    it_behaves_like 'validates presence of required fields', %i[
      first_name
      last_name
      email
      address
      bank_iban
      birthday
      city
      health_insurance
      role
      zip
      hometown
      phone
    ]

    it 'validates numericality of ZDP' do
      expect(described_class.new).to validate_numericality_of(:zdp)
        .only_integer
        .is_less_than(999_999)
        .is_greater_than(10_000)
    end

    describe 'uniqueness validations' do
      subject(:user) { build(:user) }

      it 'validates uniqueness of #email and #zdp', :aggregate_failures do
        %i[email zdp].each do |field|
          expect(user).to validate_uniqueness_of(field).case_insensitive
        end
      end
    end

    describe '#bank_iban' do
      it 'does not allow invalid values', :aggregate_failures do
        expect(model).not_to allow_value('CH93 0076 2011 6238 5295 7').for(:bank_iban)
        expect(model).not_to allow_value('CH93007620116238529577').for(:bank_iban)
        expect(model).not_to allow_value('CH9300762011623852956').for(:bank_iban)
        expect(model).not_to allow_value('XX9300762011623852957').for(:bank_iban)
      end

      it 'allows valid values' do
        expect(model).to allow_value('CH9300762011623852957').for(:bank_iban)
      end
    end

    describe '#email' do
      let(:valid_emails) { %w[valid@email.org a@b.c something+other@gmail.com me@subdomain.domain.co.in] }
      let(:invalid_emails) { %w[invalid @hello.com me@.ch 1234 .ch email@email@gmail.com email@invalid+domain.com] }

      it 'allows valid emails', :aggregate_failures do
        valid_emails.each do |valid_email|
          expect(model).to allow_value(valid_email).for :email
        end
      end

      it 'does not allow valid emails', :aggregate_failures do
        invalid_emails.each do |invalid_email|
          expect(model).not_to allow_value(invalid_email).for :email
        end
      end
    end

    context 'when some validations would be invalid' do
      let(:user) { create :user }

      before do
        user.bank_iban = 'invalid'
        user.health_insurance = ''
        user.save validate: false
      end

      context 'when something else was changed along with a new password' do
        let(:update_user) { user.update(encrypted_password: 'myencrypted', first_name: 'New name') }

        it 'still validates' do
          expect { update_user }.not_to(change { user.reload.encrypted_password })
        end

        it 'is invalid' do
          update_user
          expect(user.valid?).to be false
        end
      end

      context 'when some field other than the password was changed' do
        let(:update_user) { user.update(first_name: 'New name', last_name: 'name') }

        it 'does not allow a change', :aggregate_failures do
          expect { update_user }.not_to(change { user.reload.first_name })
        end

        it 'is invalid' do
          update_user
          expect(user.valid?).to be false
        end
      end
    end
  end

  describe '#zip_with_city' do
    subject { build(:user, zip: 6274, city: 'RSpec-Hausen').zip_with_city }

    it { is_expected.to eq '6274 RSpec-Hausen' }
  end

  describe '#self.strip_iban' do
    it 'removes whitespaces from iban' do
      expect(described_class.strip_iban(' CH56 0483 5012 3456 7800 9')).to eq 'CH5604835012345678009'
    end
  end

  describe '#prettified_bank_iban' do
    subject { build(:user, bank_iban: ugly_iban).prettified_bank_iban }

    let(:ugly_iban) { 'CH5604835012345678009' }
    let(:nice_iban) { 'CH56 0483 5012 3456 7800 9' }

    it { is_expected.to eq nice_iban }
  end

  describe '#full_name' do
    subject { build(:user, first_name: 'Peter', last_name: 'Zivi').full_name }

    it { is_expected.to eq 'Peter Zivi' }
  end

  describe '#active?' do
    subject { user.active? }

    let(:user) { build(:user, services: [service]) }
    let(:ending) { (beginning + 4.weeks).at_end_of_week - 2.days }
    let(:service) { build :service, beginning: beginning, ending: ending }

    context 'when the user\'s currently doing civil service' do
      let(:beginning) { Time.zone.today.at_beginning_of_week }

      it { is_expected.to be true }
    end

    context 'when the user is not doing civil service' do
      let(:beginning) { Time.zone.today.at_beginning_of_week + 1.week }

      it { is_expected.to be false }
    end

    context 'when the civil service he\'s currently doing ends today' do
      let(:beginning) { Time.zone.today.at_beginning_of_week - 1.week }
      let(:service) { build :service, :last, beginning: beginning, ending: Time.zone.today }

      it { is_expected.to be true }
    end
  end

  describe '#active_service' do
    subject(:user) { build(:user, services: services) }

    let(:services) { [past_service, future_service, current_service] }
    let(:now) { Time.zone.today }
    let(:past_service) { build_stubbed :service, beginning: now - 2.months, ending: now - 3.weeks }
    let(:current_service) { build_stubbed :service, beginning: now - 1.month, ending: now + 4.weeks }
    let(:future_service) { build_stubbed :service, beginning: now + 2.months, ending: now + 4.months }

    it 'returns the service which the user is currently doing' do
      expect(user.active_service).to be current_service
    end
  end

  describe '#next_service' do
    subject(:user) { build(:user, services: services) }

    let(:services) { [second_future_service, future_service, current_service] }
    let(:now) { Time.zone.today }
    let(:current_service) { build :service, beginning: now - 1.month, ending: now + 4.weeks }
    let(:future_service) { build :service, beginning: now + 2.months, ending: now + 4.months }
    let(:second_future_service) { build :service, beginning: now + 1.year, ending: now + 1.year + 4.weeks }

    it 'returns the service which the user is currently doing' do
      expect(user.next_service).to be future_service
    end
  end

  describe 'JWT payload' do
    let(:payload) { Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).second }

    context 'when user is admin' do
      let(:user) { build_stubbed :user, :admin }

      it 'has #true isAdmin payload' do
        expect(payload).to include isAdmin: true
      end
    end

    context 'when user is civil servant' do
      let(:user) { create :user }

      it 'has #false isAdmin payload' do
        expect(payload).to include isAdmin: false
      end
    end
  end

  describe '#self.validate_given_params' do
    subject(:errors) { described_class.validate_given_params(params) }

    let(:params) { { bank_iban: '' } }

    it 'validates only the given fields', :aggregate_failures do
      expect(errors.added?(:bank_iban, :blank)).to be true
      expect(errors.added?(:bank_iban, :too_short)).to be true
      expect(errors.attribute_names).to eq [:bank_iban]
    end
  end

  describe '#reset_password' do
    subject(:user) { create :user }

    let(:new_password) { 'even more secure new password' }

    it 'updates password' do
      expect { user.reset_password(new_password, new_password) }.to change(user, :password)
    end
  end
end
