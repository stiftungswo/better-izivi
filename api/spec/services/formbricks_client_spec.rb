# frozen_string_literal: true

require 'rails_helper'

RSpec.describe FormbricksClient do
  subject(:client) { described_class.new }

  let(:http_double) { instance_double(Net::HTTP) }
  let(:response) do
    instance_double(Net::HTTPResponse, body: {
      data: [
        { id: 'link-survey-1', name: 'Exit Survey', type: 'link' },
        { id: 'app-survey-1', name: 'In-App Survey', type: 'app' }
      ]
    }.to_json)
  end
  let(:requests) { [] }

  before do
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with('FORMBRICKS_API_HOST').and_return('https://formbricks.example.com')
    allow(ENV).to receive(:fetch).with('FORMBRICKS_API_KEY').and_return('formbricks-api-key')
    allow(Net::HTTP).to receive(:new).and_return(http_double)
    allow(http_double).to receive(:use_ssl=)
    allow(http_double).to receive(:verify_mode=)
    allow(http_double).to receive(:request) do |req|
      requests << req
      response
    end
  end

  describe '#link_surveys' do
    it 'requests the management surveys endpoint with the api key header', :aggregate_failures do
      client.link_surveys
      request = requests.first

      expect(request).to be_a(Net::HTTP::Get)
        .and have_attributes(uri: URI('https://formbricks.example.com/api/v1/management/surveys'))
      expect(request['x-api-key']).to eq 'formbricks-api-key'
    end

    it 'returns only surveys of type "link"' do
      expect(client.link_surveys).to eq [{ 'id' => 'link-survey-1', 'name' => 'Exit Survey', 'type' => 'link' }]
    end

    it 'returns an empty array when there are no surveys' do
      allow(response).to receive(:body).and_return({ data: [] }.to_json)

      expect(client.link_surveys).to eq []
    end
  end
end
