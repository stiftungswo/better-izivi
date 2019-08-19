# frozen_string_literal: true

class FeedbackMailer < ApplicationMailer
  def feedback_reminder_mail(user)
    @user = user
    @feedback_url = format(ENV['FEEDBACK_MAIL_SURVEY_URL'], email: user.email)

    mail to: user.email, from: ENV['MAIL_SENDER']
  end
end
