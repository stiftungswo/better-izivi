# frozen_string_literal: true

class SendFeedbackRemindersJob < ApplicationJob
  queue_as :mailers

  def perform
    FeedbackReminderMailSenderService.new.send_reminders
  end
end
