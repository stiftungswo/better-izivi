# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Service, type: :model do
  describe 'validations' do
    it_behaves_like 'validates presence of required fields', %i[
      ending
      beginning
      user
      service_specification
      service_type
    ]

    it_behaves_like 'validates that the ending is after beginning' do
      let(:model) { build(:service, :last, beginning: beginning, ending: ending) }
    end

    describe '#length_is_valid' do
      subject { service.tap(&:validate).errors.added? :service_days, :invalid_length }

      let(:service) { build(:service, beginning: beginning, ending: ending, user: user) }
      let(:user) { create :user }
      let(:service_range) { get_service_range months: 2 }
      let(:beginning) { service_range.begin }
      let(:ending) { service_range.end }

      context 'when service is normal' do
        context 'when service has a length that is bigger then 26 days' do
          it { is_expected.to be false }
        end

        context 'when service has a length that is less then 26 days' do
          let(:service_range) { Date.parse('2018-01-01')..Date.parse('2018-01-19') }

          it { is_expected.to be true }
        end
      end

      context 'when service is last' do
        let(:service) { build(:service, beginning: beginning, ending: ending, user: user, service_type: :last) }

        context 'when service has a length that is bigger then 26 days' do
          it { is_expected.to be false }
        end

        context 'when service has a length that is less then 26 days' do
          let(:service_range) { Date.parse('2018-01-01')..Date.parse('2018-01-19') }

          it { is_expected.to be false }
        end
      end
    end

    describe 'ending_is_friday validation' do
      subject { build(:service, ending: ending).tap(&:validate).errors.added? :ending, :not_a_friday }

      let(:ending) { Time.zone.today.at_end_of_week - 2.days }

      context 'when ending is a friday' do
        it { is_expected.to be false }
      end

      context 'when ending is a saturday' do
        let(:ending) { Time.zone.today.at_end_of_week - 1.day }

        it { is_expected.to be true }
      end
    end

    describe '#beginning_is_monday' do
      subject do
        build(:service, beginning: beginning, ending: ending)
          .tap(&:validate).errors.added? :beginning, :not_a_monday
      end

      let(:beginning) { Time.zone.today.at_beginning_of_week }
      let(:ending) { (beginning + 4.weeks).at_end_of_week - 2.days }

      context 'when beginning is a monday' do
        it { is_expected.to be false }
      end

      context 'when beginning is a tuesday' do
        let(:beginning) { Time.zone.today.at_beginning_of_week + 1.day }

        it { is_expected.to be true }
      end
    end

    describe '#no_overlapping_service' do
      subject { service.tap(&:validate).errors.added? :beginning, :overlaps_service }

      let(:service) { build(:service, beginning: beginning, ending: ending, user: user) }
      let(:user) { create :user }
      let(:service_range) { get_service_range months: 2 }
      let(:beginning) { service_range.begin }
      let(:ending) { service_range.end }
      let(:other_beginning) { (service_range.begin - 2.months).at_beginning_of_week }
      let(:other_ending) { (service_range.begin - 1.month).at_end_of_week - 2.days }

      before { create :service, user: user, beginning: other_beginning, ending: other_ending }

      context 'when there is no overlapping service' do
        it { is_expected.to be false }
      end

      context 'when there is an overlapping service' do
        let(:other_ending) { service_range.begin.at_end_of_week - 2.days }

        it { is_expected.to be true }
      end
    end
  end

  describe 'delegated methods' do
    subject(:service) { described_class.new }

    it 'delegates the correct methods to calculators', :aggregate_failures do
      expect(service).to delegate_method(:used_sick_days).to(:used_days_calculator)
      expect(service).to delegate_method(:used_paid_vacation_days).to(:used_days_calculator)
      expect(service).to delegate_method(:remaining_sick_days).to(:remaining_days_calculator)
      expect(service).to delegate_method(:remaining_paid_vacation_days).to(:remaining_days_calculator)
    end
  end

  describe 'memoization' do
    let(:service) { build :service }
    let(:used_days_calculator) { instance_double ExpenseSheetCalculators::UsedDaysCalculator }
    let(:remaining_days_calculator) { instance_double ExpenseSheetCalculators::RemainingDaysCalculator }

    before do
      allow(ExpenseSheetCalculators::UsedDaysCalculator).to receive(:new).and_return used_days_calculator
      allow(used_days_calculator).to receive(:used_sick_days)
      allow(used_days_calculator).to receive(:used_paid_vacation_days)

      allow(ExpenseSheetCalculators::RemainingDaysCalculator).to receive(:new).and_return remaining_days_calculator
      allow(remaining_days_calculator).to receive(:remaining_sick_days)
      allow(remaining_days_calculator).to receive(:remaining_paid_vacation_days)
    end

    it 'creates a used_days_calculator' do
      service.used_sick_days
      service.used_paid_vacation_days
      expect(ExpenseSheetCalculators::UsedDaysCalculator).to have_received(:new).exactly(1).times
    end

    it 'creates a remaining_days_calculator' do
      service.remaining_sick_days
      service.remaining_paid_vacation_days
      expect(ExpenseSheetCalculators::RemainingDaysCalculator).to have_received(:new).exactly(1).times
    end
  end

  describe '#at_year' do
    subject(:services) { described_class.at_year(2018) }

    before do
      create_pair :service, beginning: '2018-11-05', ending: '2018-11-30'
      create :service, beginning: '2017-02-06', ending: '2018-01-05'
      create :service, beginning: '2017-02-06', ending: '2017-03-24'
    end

    it 'returns only services that are at least partially in this year' do
      expect(services.count).to eq 3
    end
  end

  describe '#service_days' do
    let(:service) { build(:service, beginning: beginning, ending: beginning + 25.days) }
    let(:beginning) { Time.zone.today.beginning_of_week }

    it 'returns the service days of the service' do
      expect(service.service_days).to eq 26
    end
  end

  describe '#eligible_paid_vacation_days' do
    let(:service) { build(:service, :long, beginning: beginning, ending: beginning + 214.days) }
    let(:beginning) { Time.zone.today.beginning_of_week }

    it 'returns the eligible personal vacation days of the service' do
      expect(service.eligible_paid_vacation_days).to eq 10
    end
  end

  describe '#eligible_sick_days' do
    let(:service) { build(:service, beginning: beginning, ending: beginning + 25.days) }
    let(:beginning) { Time.zone.today.beginning_of_week }
    let(:service_calculator) { instance_double ServiceCalculator }

    before do
      allow(ServiceCalculator).to receive(:new).and_return service_calculator
      allow(service_calculator).to receive(:calculate_chargeable_service_days).and_return 26
      allow(service_calculator).to receive(:calculate_eligible_sick_days)
    end

    it 'calls ServiceCalculator#calculate_eligible_sick_days' do
      service.eligible_sick_days
      expect(service_calculator).to have_received(:calculate_eligible_sick_days).with 26
    end
  end

  describe '#expense_sheets' do
    subject { service.expense_sheets }

    let(:beginning) { (Time.zone.today - 3.months).beginning_of_week }
    let(:ending) { (Time.zone.today - 1.week).end_of_week - 2.days }

    let(:user) { create :user }
    let(:service) { create(:service, user: user, beginning: beginning, ending: ending) }

    context 'when it has one expense_sheet' do
      let(:expense_sheet) { create :expense_sheet, user: user, beginning: beginning, ending: ending }

      it { is_expected.to eq [expense_sheet] }
    end

    context 'when it has multiple expense_sheets' do
      let(:expense_sheets) { create_list :expense_sheet, 3, user: user, beginning: beginning, ending: ending }

      it { is_expected.to eq expense_sheets }
    end
  end

  describe '#send_feedback_reminder' do
    subject(:service) { build :service, user: build(:user) }

    let(:envs) do
      {
        FEEDBACK_MAIL_SURVEY_URL: 'http://example.com?service_id=%<service_id>s',
        FEEDBACK_MAIL_TESTIMONIAL_URL: 'https://naturzivi.ch/testimonial',
        FEEDBACK_MAIL_GOOGLE_REVIEW_URL: 'https://g.page/r/Ceus2ke10hBiEAg/review',
        MAIL_SENDER: 'from@example.com'
      }
    end

    it 'sends a mail to the user' do
      ClimateControl.modify envs do
        expect { service.send_feedback_reminder }.to(
          change { ActionMailer::Base.deliveries.count }.by(1)
        )
      end
    end

    it 'sets #feedback_mail_sent to true' do
      ClimateControl.modify envs do
        expect { service.send_feedback_reminder }.to change(service, :feedback_mail_sent).from(false).to(true)
      end
    end
  end

  describe '#in_future?' do
    subject { build(:service, :last, beginning: beginning).in_future? }

    context 'when service will start in future' do
      let(:beginning) { (Time.zone.today + 2.weeks).at_beginning_of_week }

      it { is_expected.to be true }
    end

    context 'when service already started' do
      let(:beginning) { (Time.zone.today - 1.week).at_beginning_of_week }

      it { is_expected.to be false }
    end

    context 'when service starts today' do
      let(:beginning) { Time.zone.today }

      it { is_expected.to be false }
    end
  end

  describe '#date_range' do
    subject { build(:service, beginning: beginning, ending: ending).date_range }

    let(:beginning) { Date.parse '2018-10-29' }
    let(:ending) { Date.parse '2018-11-30' }

    it { is_expected.to eq beginning..ending }
  end

  describe '#work_record_available?' do
    subject do
      build(:service, beginning: beginning, ending: ending,
                      service_specification: service_specification).work_record_available?
    end

    let(:service_specification) do
      build(:service_specification,
            certificate_of_employment_template: certificate_of_employment_template,
            confirmation_of_employment_template: confirmation_of_employment_template)
    end

    let(:beginning) { Date.parse '2018-10-29' }
    let(:ending) { Date.parse '2018-11-30' }
    let(:certificate_of_employment_template) { nil }
    let(:confirmation_of_employment_template) { nil }

    it { is_expected.to be false }

    context 'when service is a short service and confirmation template exists' do
      let(:confirmation_of_employment_template) { 'Template.docx' }

      it { is_expected.to be true }
    end

    context 'when service is a short service and confirmation template does not exist' do
      let(:confirmation_of_employment_template) { nil }

      it { is_expected.to be false }
    end

    context 'when service is a long service and certificate template exists' do
      let(:ending) { Date.parse '2019-11-30' }
      let(:certificate_of_employment_template) { 'Template.docx' }

      it { is_expected.to be true }
    end

    context 'when service is a long service and certificate template does not exist' do
      let(:ending) { Date.parse '2019-11-30' }
      let(:certificate_of_employment_template) { nil }

      it { is_expected.to be false }
    end
  end
end
