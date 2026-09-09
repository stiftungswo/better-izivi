# frozen_string_literal: true

require 'rails_helper'

RSpec.describe FeedbackReminderMailSenderService, type: :service do
  subject(:service) { described_class.new }

  describe '#send_reminders' do
    let(:included_ending) { Time.zone.now.at_end_of_week - 1.week - 2.days }
    let(:excluded_ending) { Time.zone.now.at_end_of_week + 1.week - 2.days }
    let(:service_specification) { create :service_specification, formbricks_survey_id: 'survey-123' }
    let!(:included_services) { create_pair :service, ending: included_ending, service_specification: }
    let!(:excluded_services) do
      create_pair(:service, ending: excluded_ending, service_specification:) <<
        create(:service, ending: included_ending, feedback_mail_sent: true, service_specification:)
    end

    it 'sends mail to the users of completed services' do
      expect { service.send_reminders }.to change { ActionMailer::Base.deliveries.count }.by(included_services.length)
    end

    it 'sets #feedback_mail_sent to true for done services' do
      expect { service.send_reminders }.to(
        change { included_services.map(&:reload).map(&:feedback_mail_sent).all? }.from(false).to(true)
      )
    end

    it 'does not touch the excluded services' do
      expect { service.send_reminders }.not_to(
        change { excluded_services.map { |excluded_service| excluded_service.reload.attributes } }
      )
    end
  end

  describe '#send_reminders when a service specification has no formbricks survey configured' do
    let(:service_specification) { create :service_specification, formbricks_survey_id: nil }
    let!(:pending_service) do
      create :service, ending: Time.zone.now.at_end_of_week - 1.week - 2.days, service_specification:
    end

    it 'does not send a feedback reminder for it' do
      expect { service.send_reminders }.not_to change(ActionMailer::Base.deliveries, :count)
    end

    it 'leaves feedback_mail_sent as false so it is retried on the next run' do
      expect { service.send_reminders }.not_to(change { pending_service.reload.feedback_mail_sent })
    end

    context 'when an admin opted in to missing-survey notifications' do
      let(:admin) { create(:user, :admin).tap { |user| user.update!(notify_on_missing_survey: true) } }

      before { admin }

      it 'emails that admin about the missing survey', :aggregate_failures do
        expect { service.send_reminders }.to change(ActionMailer::Base.deliveries, :count).by(1)

        mail = ActionMailer::Base.deliveries.last
        expect(mail.to).to eq [admin.email]
        expect(mail.body.encoded).to include(service_specification.name)
      end
    end

    context 'when no admin opted in to missing-survey notifications' do
      it 'does not send any notification mail' do
        expect { service.send_reminders }.not_to change(ActionMailer::Base.deliveries, :count)
      end
    end
  end
end
