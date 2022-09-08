# frozen_string_literal: true

require 'rails_helper'

RSpec.describe V1::CertificateController, type: :request do
  describe '#show' do
    let(:user) { create :user, :admin }
    let(:token) { generate_jwt_token_for_user(user) }
    let(:service) { create :service, user: user }
    let(:request) { get "/v1/export_certificate/#{service.id}.docx", params: { token: token } }

    context 'when user is an admin' do
      it 'returns a content type docx' do
        request
        expect(response.headers['Content-Type']).
        to include 'vnd.openxmlformats-officedocument.wordprocessingml.document'
      end

      it 'returns status code 200' do
        request
        expect(response).to have_http_status(:ok)
      end
    end

    context 'when user is a civil servant' do
      let(:user) { create :user }
      let(:token) { generate_jwt_token_for_user(user) }

      it 'returns status code 401' do
        request
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when no user is logged in' do
      let(:token) { nil }
      let(:request) { get "/v1/export_certificate/#{service.id}.docx", params: { token: 'gugus' } }

      it 'returns status code 401' do
        request
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
