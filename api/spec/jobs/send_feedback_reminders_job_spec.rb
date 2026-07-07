# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SendFeedbackRemindersJob, type: :job do
  describe '#perform' do
    let(:service) { instance_double(FeedbackReminderMailSenderService, send_reminders: true) }

    before { allow(FeedbackReminderMailSenderService).to receive(:new).and_return(service) }

    it 'delegates to FeedbackReminderMailSenderService#send_reminders' do
      described_class.new.perform

      expect(service).to have_received(:send_reminders)
    end
  end
end
