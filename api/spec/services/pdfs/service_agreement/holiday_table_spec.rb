# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Pdfs::ServiceAgreement::HolidayTable, type: :service do
  describe '#render' do
    let(:pdf) { described_class.new(service).render }
    let(:service) { create :service, service_data.merge(service_data_defaults) }
    let(:user) { service.user }
    let!(:company_holiday) { create :holiday, beginning: '2021-12-27', ending: '2021-12-31' }

    let(:service_data) { {} }
    let(:service_data_defaults) { { beginning: '2021-10-18', ending: '2022-10-14' } }

    let(:pdf_page_inspector) { PDF::Inspector::Page.analyze(pdf) }
    let(:text_analysis) { PDF::Inspector::Text.analyze(pdf) }
    let(:pdf_as_string) { text_analysis.strings.join(" ")} 
   
    context 'when is german' do
      
      it "contains '#{I18n.t('pdfs.holiday_table.holiday_not_taken_into_account')}'" do
        expect(pdf_as_string).to include I18n.t('pdfs.holiday_table.holiday_not_taken_into_account')
      end


      context 'when the service is long' do
        let(:service_data) { { long_service: true } }

        it "contains '#{I18n.t('pdfs.holiday_table.holiday_taken_into_account')}'" do
          expect(pdf_as_string).to include I18n.t('pdfs.holiday_table.holiday_taken_into_account')
        end
      end

      context 'when there is no company_holiday during the service' do
        let(:company_holiday) { nil }

        it "contains warning text" do
          expect(pdf_as_string).to include "you should never see this page"
        end
      end

      it 'renders 1 page' do
        expect(pdf_page_inspector.pages.size).to eq 1
      end
    end

    context 'when it is french' do

      I18n.with_locale('fr') do
        
        let(:service) { create :service, :valais, service_data.merge(service_data_defaults) }
        
        it "contains '#{I18n.t('pdfs.holiday_table.holiday_not_taken_into_account')}'" do
          expect(pdf_as_string).to include I18n.t('pdfs.holiday_table.holiday_not_taken_into_account')
        end
        
        context 'when the service is long' do
          let(:service_data) { { long_service: true } }
          
          it "contains '#{I18n.t('pdfs.holiday_table.holiday_taken_into_account')}'" do
            expect(pdf_as_string).to include I18n.t('pdfs.holiday_table.holiday_taken_into_account')
          end
        end
        
        context 'when there is no company_holiday during the service' do
          let(:company_holiday) { nil }
          
          it 'contains warning text' do
            expect(pdf_as_string).to include 'you should never see this page'
          end
        end
        
        it 'renders 1 page' do
          expect(pdf_page_inspector.pages.size).to eq 1
        end
        
      end
    end
  end
end
