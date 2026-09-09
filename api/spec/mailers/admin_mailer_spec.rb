# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminMailer, type: :mailer do
  describe 'missing_feedback_survey_mail' do
    let(:service_specification) { build_stubbed :service_specification, name: 'Zivildienst Normal' }
    let(:mail) { described_class.missing_feedback_survey_mail(recipient_emails, [service_specification]) }
    let(:recipient_emails) { ['admin1@example.com', 'admin2@example.com'] }
    let(:envs) { { MAIL_SENDER: 'from@example.com' } }

    describe 'header' do
      it 'renders the headers', :aggregate_failures do
        ClimateControl.modify envs do
          expect(mail.subject).to eq I18n.t('admin_mailer.missing_feedback_survey_mail.subject')
          expect(mail.to).to eq recipient_emails
          expect(mail.from).to eq(['from@example.com'])
        end
      end
    end

    describe 'body' do
      it 'lists the service specifications missing a survey' do
        ClimateControl.modify envs do
          expect(mail.body.encoded).to include(service_specification.name)
        end
      end
    end
  end
end
