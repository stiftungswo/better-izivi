# frozen_string_literal: true

require 'rails_helper'

RSpec.describe VersionController, type: :request do
  describe 'GET /version' do
    it 'reports the build info from the environment without authentication' do
      build_time = '2026-11-12T10:00:00Z'
      stub_const('ENV', ENV.to_h.merge('GIT_SHA' => 'abc123', 'GIT_BRANCH' => 'develop', 'BUILD_TIME' => build_time))

      get '/version'

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body).to eq('sha' => 'abc123', 'branch' => 'develop', 'built_at' => build_time)
    end
  end
end
