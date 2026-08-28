# frozen_string_literal: true

require 'rails_helper'

RSpec.describe FormbricksClient do
  subject(:client) { described_class.new }

  let(:http_double) { instance_double(Net::HTTP) }
  let(:surveys_body) do
    {
      data: [
        { id: 'link-survey-1', name: 'Exit Survey', type: 'link' },
        { id: 'app-survey-1', name: 'In-App Survey', type: 'app' }
      ]
    }.to_json
  end
  let(:response) { build_response(Net::HTTPOK, '200', surveys_body) }
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

  def build_response(klass, code, body)
    klass.new('1.1', code, 'reason').tap { |resp| allow(resp).to receive(:body).and_return(body) }
  end

  describe '#initialize' do
    it 'raises a FormbricksApiError when FORMBRICKS_API_HOST is not https' do
      allow(ENV).to receive(:fetch).with('FORMBRICKS_API_HOST').and_return('http://formbricks.example.com')

      expect { described_class.new }.to raise_error(FormbricksApiError, /https/)
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

    it 'raises a FormbricksApiError when the request is unauthorized' do
      allow(http_double).to receive(:request).and_return(build_response(Net::HTTPUnauthorized, '401', ''))

      expect { client.link_surveys }.to raise_error(FormbricksApiError, /401/)
    end

    it 'raises a FormbricksApiError when the request fails on the Formbricks side' do
      allow(http_double).to receive(:request).and_return(build_response(Net::HTTPInternalServerError, '500', ''))

      expect { client.link_surveys }.to raise_error(FormbricksApiError, /500/)
    end

    it 'raises a FormbricksApiError when the network request itself fails' do
      allow(http_double).to receive(:request).and_raise(SocketError, 'getaddrinfo failed')

      expect { client.link_surveys }.to raise_error(FormbricksApiError, /getaddrinfo failed/)
    end

    it 'raises a FormbricksApiError when the response body is not valid JSON' do
      allow(response).to receive(:body).and_return('not json')

      expect { client.link_surveys }.to raise_error(FormbricksApiError, /invalid JSON/)
    end

    it 'treats a missing "data" key as no surveys' do
      allow(response).to receive(:body).and_return({}.to_json)

      expect(client.link_surveys).to eq []
    end

    [
      'null',
      '[]',
      '{"data": null}',
      '{"data": [null]}',
      '{"data": [{"type": "link"}]}',
      '{"data": [{"id": "", "name": "Exit Survey", "type": "link"}]}',
      '{"data": [{"id": "link-survey-1", "name": "", "type": "link"}]}',
      '{"data": [{"id": 123, "name": "Exit Survey", "type": "link"}]}'
    ].each do |malformed_body|
      it "raises a FormbricksApiError for the semantically malformed body `#{malformed_body}`" do
        allow(response).to receive(:body).and_return(malformed_body)

        expect { client.link_surveys }.to raise_error(FormbricksApiError, /unexpected response shape/)
      end
    end
  end
end
