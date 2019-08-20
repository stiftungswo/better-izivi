# frozen_string_literal: true

class FeedbackReminderMailSenderService
  def send_reminders
    services = Service.where(feedback_mail_sent: false).where(Service.arel_table[:ending].lt(Time.zone.now))

    services.each do |service|
      FeedbackMailer.feedback_reminder_mail(service).deliver_now
      service.update feedback_mail_sent: true
    end
  end
end
