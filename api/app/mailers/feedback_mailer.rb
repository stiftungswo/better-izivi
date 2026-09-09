# frozen_string_literal: true

class FeedbackMailer < ApplicationMailer
  def feedback_reminder_mail(service)
    @user = service.user
    survey_id = service.service_specification.formbricks_survey_id
    api_host = ENV.fetch('FORMBRICKS_API_HOST')
    raise FormbricksApiError, 'FORMBRICKS_API_HOST must use https' unless URI(api_host).scheme == 'https'

    @feedback_url = "#{api_host}/s/#{survey_id}?service_id=#{service.id}"
    @testimonial_url = ENV.fetch('FEEDBACK_MAIL_TESTIMONIAL_URL', nil)
    @googlereview_url = ENV.fetch('FEEDBACK_MAIL_GOOGLE_REVIEW_URL', nil)

    mail to: @user.email, from: ENV.fetch('MAIL_SENDER', nil),
         subject: I18n.t('feedback_mailer.feedback_reminder_mail.subject')
  end
end
