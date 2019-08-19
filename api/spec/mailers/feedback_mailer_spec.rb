# frozen_string_literal: true

require 'rails_helper'

RSpec.describe FeedbackMailer, type: :mailer do
  describe 'feedback_reminder_mail' do
    let(:user) { build_stubbed :user }
    let(:mail) { described_class.feedback_reminder_mail(user) }

    before do
      allow(ENV).to receive(:[]).with('MAIL_SENDER').and_return 'from@example.com'
      I18n.locale = :de
    end

    after { I18n.locale = I18n.default_locale }

    it 'renders the headers' do
      expect(mail.subject).to eq I18n.t('feedback_mailer.feedback_reminder_mail.subject')
      expect(mail.to).to eq([user.email])
      expect(mail.from).to eq(['from@example.com'])
    end

    it 'contains the correct greeting' do
      expect(mail.body.encoded).to match("Lieber #{user.full_name}")
    end
  end
end
