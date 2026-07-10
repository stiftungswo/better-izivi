# frozen_string_literal: true

require 'rails_helper'

require 'pp'

RSpec.describe Pdfs::ServiceAgreement::GlueService, type: :service do
  describe '#render' do
    context 'when locale is german' do
      around do |spec|
        I18n.with_locale(:de) do
          spec.run
        end
      end

      let(:pdf) { described_class.new(service).render }
      let(:service) { create :service, service_data }
      let(:service_specification) { create :service_specification, identification_number: 82_846 }
      let(:service_data) do
        {
          beginning: Date.parse('2018-01-01'),
          ending: Date.parse('2018-02-23'),
          service_specification:
        }
      end

      let(:pdf_strings) do
        ClimateControl.modify envs do
          PDF::Inspector::Text.analyze(pdf).strings
        end
      end
      let(:pdf_page_inspector) { PDF::Inspector::Page.analyze(pdf) }

      let(:sender_name) { 'SWO Stiftung Wirtschaft und Öl' }
      let(:sender_address) { 'Hauptstrasse 23d' }
      let(:sender_zip_city) { '9542 Schwerzenbach' }
      let(:envs) do
        {
          SERVICE_AGREEMENT_LETTER_SENDER_NAME: sender_name,
          SERVICE_AGREEMENT_LETTER_SENDER_ADDRESS: sender_address,
          SERVICE_AGREEMENT_LETTER_SENDER_ZIP_CITY: sender_zip_city
        }
      end

      let(:page_text_check_texts) do
        [
          'Einsatzvereinbarung',
          'Taschengeld',
          'Anstellungsbedingungen der SWO',
          'Zeckenschutzimpfung ',
          'Lieber Zivi'
        ]
      end

      it 'renders five pages' do
        expect(pdf_page_inspector.pages.size).to eq 5
      end

      it 'renders pages in correct order', :aggregate_failures do
        pdf_page_inspector.pages.each_with_index do |item, index|
          joined = item[:strings].join(' ')
          expected_string = page_text_check_texts[index]

          raise "page at index #{index} should include '#{expected_string}'" unless joined.include? expected_string
        end
      end
    end
  end
end
