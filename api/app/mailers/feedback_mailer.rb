# frozen_string_literal: true

class FeedbackMailer < ApplicationMailer
  def feedback_reminder_mail(service)
    @user = service.user
    @feedback_url = format(ENV['FEEDBACK_MAIL_SURVEY_URL'], service_id: service.id)

    mail to: @user.email, from: ENV['MAIL_SENDER'],
         subject: I18n.t('izivi.backend.feedback_mailer.feedback_reminder_mail.subject')
  end
end
