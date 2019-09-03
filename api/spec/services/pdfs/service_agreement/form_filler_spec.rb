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
    let(:xobjects_values) do
      pdf_xobjects_inspector.page_xobjects[0].values.map(&:unfiltered_data).map do |data|
        next checkbox_checked if data.include?(checkbox_checked)
        next '' unless data.include?('(') && data.include?(')')

        data[/\(.*\)/]&.strip
      end.join(' ')
    end

    let(:checkbox_checked) do
      "0 0 0 rg\n1.56 1.56 5.64 5.64 re\nf"
    end

    let(:expected_strings) do
      company_holiday.nil? ? expected_strings_default : expected_strings_default.push(*expected_strings_holiday)
    end
    let(:expected_strings_default) do
      [
        user.zdp,
        user.last_name,
        user.first_name,
        user.address,
        user.zip_with_city,
        user.phone,
        user.bank_iban,
        user.email,
        user.health_insurance,
        I18n.l(service.beginning),
        I18n.l(service.ending),
        service.service_specification.title,
        service.conventional_service? ? checkbox_checked : '',
        service.probation_service? ? checkbox_checked : '',
        service.long_service ? checkbox_checked : ''
      ]
    end
    let(:expected_strings_holiday) do
      [
        I18n.l(company_holiday.beginning),
        I18n.l(company_holiday.ending)
      ]
    end

    context 'when is german' do
      it 'renders correct texts', :aggregate_failures do
        expected_strings.each do |value|
          escaped_value = value.to_s.dup
          [%w[( \\(], %w[) \\)]].each { |replacement| escaped_value.gsub!(replacement[0], replacement[1]) }
          expect(xobjects_values).to include escaped_value
        end
      end

      context 'when the service is long' do
        let(:service_data) { { beginning: '2018-11-05', ending: '2019-05-03', long_service: true } }

        it 'renders correct texts', :aggregate_failures do
          expected_strings.each do |value|
            escaped_value = value.to_s.dup
            [%w[( \\(], %w[) \\)]].each { |replacement| escaped_value.gsub!(replacement[0], replacement[1]) }
            expect(xobjects_values).to include escaped_value
          end
        end
      end

      context 'when the service is a probational' do
        let(:service_data) { { probation_service: true } }

        it 'renders correct texts', :aggregate_failures do
          expected_strings.each do |value|
            escaped_value = value.to_s.dup
            [%w[( \\(], %w[) \\)]].each { |replacement| escaped_value.gsub!(replacement[0], replacement[1]) }
            expect(xobjects_values).to include escaped_value
          end
        end
      end

      context 'when there is no company_holiday during the service' do
        let(:company_holiday) { nil }

        it 'renders correct texts', :aggregate_failures do
          expected_strings.each do |value|
            escaped_value = value.to_s.dup
            [%w[( \\(], %w[) \\)]].each { |replacement| escaped_value.gsub!(replacement[0], replacement[1]) }
            expect(xobjects_values).to include escaped_value
          end
        end
      end

      it 'renders 2 pages' do
        expect(pdf_page_inspector.pages.size).to eq 2
      end
    end

    context 'when it is french' do
      let(:service) { create :service, :valais, service_data.merge(service_data_defaults) }

      it 'renders correct texts', :aggregate_failures do
        expected_strings.each do |value|
          escaped_value = value.to_s.dup
          [%w[( \\(], %w[) \\)]].each { |replacement| escaped_value.gsub!(replacement[0], replacement[1]) }
          expect(xobjects_values).to include escaped_value
        end
      end

      context 'when the service is long' do
        let(:service_data) { { beginning: '2018-11-05', ending: '2019-05-03', long_service: true } }

        it 'renders correct texts', :aggregate_failures do
          expected_strings.each do |value|
            escaped_value = value.to_s.dup
            [%w[( \\(], %w[) \\)]].each { |replacement| escaped_value.gsub!(replacement[0], replacement[1]) }
            expect(xobjects_values).to include escaped_value
          end
        end
      end

      context 'when the service is a probational' do
        let(:service_data) { { probation_service: true } }

        it 'renders correct texts', :aggregate_failures do
          expected_strings.each do |value|
            escaped_value = value.to_s.dup
            [%w[( \\(], %w[) \\)]].each { |replacement| escaped_value.gsub!(replacement[0], replacement[1]) }
            expect(xobjects_values).to include escaped_value
          end
        end
      end

      context 'when there is no company_holiday during the service' do
        let(:company_holiday) { nil }

        it 'renders correct texts', :aggregate_failures do
          expected_strings.each do |value|
            escaped_value = value.to_s.dup
            [%w[( \\(], %w[) \\)]].each { |replacement| escaped_value.gsub!(replacement[0], replacement[1]) }
            expect(xobjects_values).to include escaped_value
          end
        end
      end

      it 'renders 2 pages' do
        expect(pdf_page_inspector.pages.size).to eq 2
      end
    end
  end
end
