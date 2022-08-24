# frozen_string_literal: true

require 'rails_helper'

RSpec.describe V1::PaymentsListController, type: :request do
  # rubocop:disable RSpec/OverwritingSetup
  describe '#index' do
    context 'when user is an admin' do
      let(:user) { create :user, :admin }
      let(:token) { generate_jwt_token_for_user(user) }
      let(:request) { get '/v1/payments_list.pdf', params: { token:, locale: 'de', payment: 'pending' } }

      it 'returns a content type pdf' do
        request
        expect(response.headers['Content-Type']).to include 'pdf'
      end

      it 'returns status code 200' do
        request
        expect(response).to have_http_status(:ok)
      end
    end

    context 'when user is a civil servant' do
      let(:user) { create :user }
      let(:token) { generate_jwt_token_for_user(user) }
      let(:request) { get '/v1/payments_list.pdf', params: { token:, locale: 'de' } }

      it 'returns status code 401' do
        request
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when no user is logged in' do
      let(:request) { get get_pdf_path(user) }
      let(:request) { get '/v1/payments_list.pdf', params: { token: 'meow' } }

      it 'returns status code 401' do
        request
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
  # rubocop:enable RSpec/OverwritingSetup
end
