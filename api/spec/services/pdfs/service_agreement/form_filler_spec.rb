# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Pdfs::ServiceAgreement::FormFiller, type: :service do
  describe '#render' do
    let(:pdf) { described_class.new(service).render }
    let(:service) { create :service, service_data.merge(service_data_defaults) }
    let(:user) { service.user }
    let!(:company_holiday) { create :holiday, beginning: '2018-12-28', ending: '2019-01-02' }

    let(:service_data) { {} }
    let(:service_data_defaults) { { beginning: '2018-12-24', ending: '2019-01-04' } }

    let(:pdf_page_inspector) { PDF::Inspector::Page.analyze(pdf) }
    let(:pdf_xobjects_inspector) { PDF::Inspector::XObject.analyze(pdf) }

    let(:checkbox_checked) do
      "0 0 0 rg\n1.56 1.56 5.64 5.64 re\nf"
    end

    context 'when is german' do
      let(:expected_strings) do
        company_holiday.nil? ? expected_strings_default : expected_strings_default.merge(expected_strings_holiday)
      end
      let(:expected_strings_default) do
        {
          Xi33: user.zdp,
          Xi38: user.last_name,
          Xi34: user.first_name,
          Xi39: user.address,
          Xi35: user.zip_with_city,
          Xi36: user.phone,
          Xi12: user.bank_iban,
          Xi37: user.email,
          Xi13: user.health_insurance,
          Xi46: I18n.l(service.beginning),
          Xi45: I18n.l(service.ending),
          Xi47: service.service_specification.title,
          Xi0: service.conventional_service? ? checkbox_checked : '',
          Xi9: service.probation_service? ? checkbox_checked : '',
          Xi1: service.long_service ? checkbox_checked : ''
        }
      end
      let(:expected_strings_holiday) do
        {
          Xi48: I18n.l(company_holiday.beginning),
          Xi51: I18n.l(company_holiday.ending)
        }
      end

      it 'renders correct texts', :aggregate_failures do
        expected_strings.map do |index, value|
          escaped_value = value.to_s.dup
          [%w[( \\(], %w[) \\)]].each { |replacement| escaped_value.gsub!(replacement[0], replacement[1]) }
          expect(pdf_xobjects_inspector.page_xobjects[0][index].unfiltered_data).to include escaped_value
        end
      end

      context 'when the service is long' do
        let(:service_data) { { beginning: '2018-11-05', ending: '2019-05-03', long_service: true } }

        it 'renders correct texts', :aggregate_failures do
          expected_strings.map do |index, value|
            escaped_value = value.to_s.dup
            [%w[( \\(], %w[) \\)]].each { |replacement| escaped_value.gsub!(replacement[0], replacement[1]) }
            expect(pdf_xobjects_inspector.page_xobjects[0][index].unfiltered_data).to include escaped_value
          end
        end
      end

      context 'when the service is a probational' do
        let(:service_data) { { probation_service: true } }

        it 'renders correct texts', :aggregate_failures do
          expected_strings.map do |index, value|
            escaped_value = value.to_s.dup
            [%w[( \\(], %w[) \\)]].each { |replacement| escaped_value.gsub!(replacement[0], replacement[1]) }
            expect(pdf_xobjects_inspector.page_xobjects[0][index].unfiltered_data).to include escaped_value
          end
        end
      end

      context 'when there is no company_holiday during the service' do
        let(:company_holiday) { nil }

        it 'renders correct texts', :aggregate_failures do
          expected_strings.map do |index, value|
            escaped_value = value.to_s.dup
            [%w[( \\(], %w[) \\)]].each { |replacement| escaped_value.gsub!(replacement[0], replacement[1]) }
            expect(pdf_xobjects_inspector.page_xobjects[0][index].unfiltered_data).to include escaped_value
          end
        end
      end

      it 'renders 2 pages' do
        expect(pdf_page_inspector.pages.size).to eq 2
      end
    end

    context 'when it is french' do
      let(:service) { create :service, :valais, service_data.merge(service_data_defaults) }

      let(:expected_strings) do
        company_holiday.nil? ? expected_strings_default : expected_strings_default.merge(expected_strings_holiday)
      end
      let(:expected_strings_default) do
        {
          Xi46: user.zdp,
          Xi25: user.last_name,
          Xi47: user.first_name,
          Xi8: user.address,
          Xi11: user.zip_with_city,
          Xi52: user.phone,
          Xi19: user.bank_iban,
          Xi18: user.email,
          Xi9: user.health_insurance,
          Xi13: I18n.l(service.beginning),
          Xi6: I18n.l(service.ending),
          Xi51: service.service_specification.title,
          Xi12: service.conventional_service? ? checkbox_checked : '',
          Xi54: service.probation_service? ? checkbox_checked : '',
          Xi50: service.long_service ? checkbox_checked : ''
        }
      end
      let(:expected_strings_holiday) do
        {
          Xi4: I18n.l(company_holiday.beginning),
          Xi5: I18n.l(company_holiday.ending)
        }
      end

      it 'renders correct texts', :aggregate_failures do
        expected_strings.map do |index, value|
          escaped_value = value.to_s.dup
          [%w[( \\(], %w[) \\)]].each { |replacement| escaped_value.gsub!(replacement[0], replacement[1]) }
          expect(pdf_xobjects_inspector.page_xobjects[0][index].unfiltered_data).to include escaped_value
        end
      end

      context 'when the service is long' do
        let(:service_data) { { beginning: '2018-11-05', ending: '2019-05-03', long_service: true } }

        it 'renders correct texts', :aggregate_failures do
          expected_strings.map do |index, value|
            escaped_value = value.to_s.dup
            [%w[( \\(], %w[) \\)]].each { |replacement| escaped_value.gsub!(replacement[0], replacement[1]) }
            expect(pdf_xobjects_inspector.page_xobjects[0][index].unfiltered_data).to include escaped_value
          end
        end
      end

      context 'when the service is a probational' do
        let(:service_data) { { probation_service: true } }

        it 'renders correct texts', :aggregate_failures do
          expected_strings.map do |index, value|
            escaped_value = value.to_s.dup
            [%w[( \\(], %w[) \\)]].each { |replacement| escaped_value.gsub!(replacement[0], replacement[1]) }
            expect(pdf_xobjects_inspector.page_xobjects[0][index].unfiltered_data).to include escaped_value
          end
        end
      end

      context 'when there is no company_holiday during the service' do
        let(:company_holiday) { nil }
        let(:expected_strings_default) do
          {
            Xi44: user.zdp,
            Xi23: user.last_name,
            Xi45: user.first_name,
            Xi6: user.address,
            Xi9: user.zip_with_city,
            Xi50: user.phone,
            Xi17: user.bank_iban,
            Xi16: user.email,
            Xi7: user.health_insurance,
            Xi11: I18n.l(service.beginning),
            Xi4: I18n.l(service.ending),
            Xi49: service.service_specification.title,
            Xi10: service.conventional_service? ? checkbox_checked : '',
            Xi52: service.probation_service? ? checkbox_checked : '',
            Xi48: service.long_service ? checkbox_checked : ''
          }
        end

        it 'renders correct texts', :aggregate_failures do
          expected_strings.map do |index, value|
            escaped_value = value.to_s.dup
            [%w[( \\(], %w[) \\)]].each { |replacement| escaped_value.gsub!(replacement[0], replacement[1]) }
            expect(pdf_xobjects_inspector.page_xobjects[0][index].unfiltered_data).to include escaped_value
          end
        end
      end

      it 'renders 2 pages' do
        expect(pdf_page_inspector.pages.size).to eq 2
      end
    end
  end
end
