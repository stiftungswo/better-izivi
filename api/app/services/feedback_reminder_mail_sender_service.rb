# frozen_string_literal: true

class FeedbackReminderMailSenderService
  def send_reminders
    Service
      .where(feedback_mail_sent: false)
      .where(Service.arel_table[:ending].lt(Time.zone.now))
      .each(&method(:send_email))
  end

  private

  def send_email(service)
    FeedbackMailer.feedback_reminder_mail(service).deliver_now
    service.update feedback_mail_sent: true

    # rubocop:disable Rails/Output
    puts "Sent to #{service.user.email} (Service id ##{service.id})"
    # rubocop:enable Rails/Output
  end
end
