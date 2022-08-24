# frozen_string_literal: true

class FeedbackMailer < ApplicationMailer
  def feedback_reminder_mail(service)
    @user = service.user
    @feedback_url = format(ENV.fetch('FEEDBACK_MAIL_SURVEY_URL', nil), service_id: service.id)
    @testimonial_url = ENV.fetch('FEEDBACK_MAIL_TESTIMONIAL_URL', nil)
    @googlereview_url = ENV.fetch('FEEDBACK_MAIL_GOOGLE_REVIEW_URL', nil)

    mail to: @user.email, from: ENV.fetch('MAIL_SENDER', nil),
         subject: I18n.t('feedback_mailer.feedback_reminder_mail.subject')
  end
end
