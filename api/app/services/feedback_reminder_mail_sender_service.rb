# frozen_string_literal: true

class FeedbackReminderMailSenderService
  def send_reminders
    skipped_specifications = candidate_services.filter_map do |service|
      if service.service_specification.formbricks_survey_id.blank?
        service.service_specification
      else
        service.send_feedback_reminder
        nil
      end
    end.uniq

    notify_admins_of_missing_surveys(skipped_specifications) if skipped_specifications.any?
  end

  private

  def candidate_services
    Service
      .where(feedback_mail_sent: false)
      .where(Service.arel_table[:ending].lt(Time.zone.now))
      .includes(:service_specification)
  end

  def notify_admins_of_missing_surveys(specifications)
    recipients = User.admin
                     .joins(:user_settings)
                     .where(user_settings: { key: User::NOTIFY_ON_MISSING_SURVEY_KEY, value: 'true' })
                     .pluck(:email)
    return if recipients.empty?

    AdminMailer.missing_feedback_survey_mail(recipients, specifications).deliver_now
  end
end
