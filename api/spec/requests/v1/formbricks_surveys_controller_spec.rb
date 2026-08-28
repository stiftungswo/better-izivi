# frozen_string_literal: true

require 'rails_helper'

RSpec.describe V1::FormbricksSurveysController, type: :request do
  describe '#index' do
    let(:request) { get v1_formbricks_surveys_path }
    let(:link_surveys) { [{ 'id' => 'survey-1', 'name' => 'Exit Survey', 'type' => 'link' }] }

    context 'when the user is signed in as admin' do
      let(:user) { create :user, :admin }

      before do
        sign_in user
        allow(FormbricksClient).to receive(:new).and_return(instance_double(FormbricksClient, link_surveys:))
      end

      it 'returns the link surveys from Formbricks' do
        request

        expect(parse_response_json(response)).to eq [{ id: 'survey-1', name: 'Exit Survey' }]
      end

      it_behaves_like 'renders a successful http status code'
    end

    context 'when Formbricks rejects the request' do
      let(:user) { create :user, :admin }

      before do
        sign_in user
        allow(FormbricksClient).to receive(:new)
          .and_raise(FormbricksApiError, 'Formbricks API request failed with status 401')
      end

      it 'renders a bad gateway error instead of an empty list', :aggregate_failures do
        request

        expect(response).to have_http_status(:bad_gateway)
        expect(parse_response_json(response)).to eq(error: 'Formbricks API request failed with status 401')
      end
    end

    context 'when the user is signed in but not an admin' do
      let(:user) { create :user }

      before { sign_in user }

      it_behaves_like 'admin protected resource'
    end

    context 'when no user is signed in' do
      it_behaves_like 'login protected resource'
    end
  end
end
