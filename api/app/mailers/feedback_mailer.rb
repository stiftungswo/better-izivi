# frozen_string_literal: true

class FeedbackMailer < ApplicationMailer
  def feedback_reminder_mail(user)
    @user = user
    @feedback_url = 'http://google.com'

    mail to: user.email, from: ENV['MAIL_SENDER']
  end
end
