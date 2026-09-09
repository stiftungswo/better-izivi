# frozen_string_literal: true

class AdminMailer < ApplicationMailer
  def missing_feedback_survey_mail(recipient_emails, service_specifications)
    @service_specifications = service_specifications

    mail to: recipient_emails, from: ENV.fetch('MAIL_SENDER', nil),
         subject: I18n.t('admin_mailer.missing_feedback_survey_mail.subject')
  end
end
