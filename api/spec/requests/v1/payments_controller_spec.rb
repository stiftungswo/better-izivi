# frozen_string_literal: true

require 'rails_helper'

RSpec.describe V1::PaymentsController, type: :request do
  describe '#show' do
    let!(:user) { create :user }

    let(:beginning) { Date.parse('2018-01-01') }
    let(:ending) { Date.parse('2018-02-23') }
    let!(:payment_timestamp) { Time.zone.now }

    context 'with token authentication' do
      let(:request) do
        get v1_payment_path(format: :xml, payment_timestamp: payment_timestamp.to_i), params: { token: token }
      end
      let(:token) { generate_jwt_token_for_user(user) }

      before do
        create :expense_sheet, :payment_in_progress,
               user: user,
               beginning: beginning,
               ending: ending,
               payment_timestamp: payment_timestamp
        create :service, user: user, beginning: beginning, ending: ending
      end

      context 'when user is an admin' do
        let(:user) { create :user, :admin }

        it_behaves_like 'renders a successful http status code'

        it 'returns a content type xml' do
          request
          expect(response.headers['Content-Type']).to include 'xml'
        end
      end

      context 'when user is a civil servant' do
        it_behaves_like 'admin protected resource'
      end

      context 'when no token is provided' do
        subject { -> { request } }

        let(:token) { nil }

        it { is_expected.to raise_exception ActionController::ParameterMissing }
      end

      context 'when an invalid token is provided' do
        let(:token) { 'invalid' }

        it_behaves_like 'admin protected resource'
      end
    end

    context 'with normal authentication' do
      let(:request) { get v1_payment_path(payment_timestamp: payment_timestamp.to_i) }

      context 'when user is an admin' do
        let(:user) { create :user, :admin }

        before { sign_in user }

        context 'when there is a payment' do
          let!(:payment) do
            Payment.new(expense_sheets: expense_sheets, payment_timestamp: payment_timestamp).tap(&:save)
          end
          let(:expense_sheets) do
            [
              create(:expense_sheet, :payment_in_progress,
                     user: user,
                     beginning: beginning,
                     ending: beginning.at_end_of_month),
              create(:expense_sheet, :payment_in_progress,
                     user: user,
                     beginning: ending.at_beginning_of_month,
                     ending: ending)
            ]
          end

          let(:expected_user_attributes) { %i[id zdp bank_iban] }
          let(:expected_user_response) do
            extract_to_json(user, *expected_user_attributes).merge(full_name: user.full_name)
          end
          let(:expected_response) do
            {
              payment_timestamp: payment.payment_timestamp.to_i,
              state: 'payment_in_progress',
              total: payment.total,
              expense_sheets: payment.expense_sheets.map do |expense_sheet|
                extract_to_json(expense_sheet, :id)
                  .merge(full_expenses: expense_sheet.calculate_full_expenses)
                  .merge(user: expected_user_response)
              end
            }
          end

          before do
            create :service, user: user, beginning: beginning, ending: ending
          end

          it_behaves_like 'renders a successful http status code'

          it 'returns a content type json' do
            request
            expect(response.headers['Content-Type']).to include 'json'
          end

          it 'renders the correct response' do
            request
            expect(parse_response_json(response)).to include(expected_response)
          end
        end

        context 'when there is no payment' do
          it_behaves_like 'renders a not found error response'
        end
      end

      context 'when user is a civil servant' do
        before { sign_in user }

        it_behaves_like 'admin protected resource'
      end

      context 'when no user is logged in' do
        it_behaves_like 'login protected resource'
      end
    end
  end
end
