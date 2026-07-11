# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AuthenticateInDime do
  let(:api_uri) { 'https://dime.example.com' }
  let(:http_double) { instance_double(Net::HTTP) }
  let(:login_response) { instance_double(Net::HTTPResponse, :[] => 'mock-dime-token') }
  let(:requests) { [] }

  before do
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with('API_URI_DIME').and_return(api_uri)
    allow(ENV).to receive(:fetch).with('USERNAME_DIME').and_return('zivi@example.com')
    allow(ENV).to receive(:fetch).with('PASSWORD_DIME').and_return('secret')
    allow(Net::HTTP).to receive(:new).and_return(http_double)
    allow(http_double).to receive(:use_ssl=)
    allow(http_double).to receive(:verify_mode=)
    allow(http_double).to receive(:request) do |req|
      requests << req
      login_response
    end
  end

  describe '#initialize' do
    it 'logs in and stores the Authorization token from the response' do
      service = described_class.new

      expect(service.instance_variable_get(:@token)).to eq 'mock-dime-token'
    end

    it 'posts the configured DIME credentials to the sign_in endpoint', :aggregate_failures do
      described_class.new
      request = requests.first

      expect(request).to be_a(Net::HTTP::Post).and have_attributes(uri: URI("#{api_uri}/v2/employees/sign_in"))
      expect(JSON.parse(request.body)).to eq('employee' => { 'email' => 'zivi@example.com', 'password' => 'secret' })
    end
  end

  describe '#post' do
    subject(:service) { described_class.new }

    let(:uri) { URI("#{api_uri}/v2/employees") }

    before { service } # consume the login request before each example clears `requests`

    it 'sends a Post without an Authorization header when there is no token' do
      service.instance_variable_set(:@token, nil)

      service.post('{}', uri)

      request = requests.last
      expect(request).to be_a(Net::HTTP::Post)
      expect(request['Authorization']).to be_nil
    end

    it 'sends a Get with the Authorization header when the body is "get"' do
      service.post('get', uri)

      request = requests.last
      expect(request).to be_a(Net::HTTP::Get)
      expect(request['Authorization']).to eq 'mock-dime-token'
    end

    it 'sends a Post with the Authorization header for any other body' do
      service.post('{"foo":"bar"}', uri)

      request = requests.last
      expect(request).to be_a(Net::HTTP::Post)
      expect(request['Authorization']).to eq 'mock-dime-token'
      expect(request.body).to eq '{"foo":"bar"}'
    end
  end

  describe '#make_user_dime' do
    it 'posts the given body to the employees endpoint' do
      service = described_class.new

      service.make_user_dime('{"email":"new@example.com"}')

      request = requests.last
      expect(request.uri.to_s).to eq "#{api_uri}/v2/employees"
      expect(request.body).to eq '{"email":"new@example.com"}'
    end
  end

  describe '#get_dime_id_with_search' do
    subject(:service) { described_class.new }

    let(:user) { create :user, dime_id: 0 }

    it 'saves and returns the found id when a matching employee exists' do
      allow(login_response).to receive(:body).and_return({ data: [{ id: 42 }] }.to_json)

      expect(service.get_dime_id_with_search(user)).to eq 42
      expect(user.reload.dime_id).to eq 42
    end

    it 'returns -1 when the data key is missing' do
      allow(login_response).to receive(:body).and_return({}.to_json)

      expect(service.get_dime_id_with_search(user)).to eq(-1)
    end

    it 'returns -1 when no employee is found' do
      allow(login_response).to receive(:body).and_return({ data: [] }.to_json)

      expect(service.get_dime_id_with_search(user)).to eq(-1)
    end

    it 'returns -1 when the found employee has no id' do
      allow(login_response).to receive(:body).and_return({ data: [{}] }.to_json)

      expect(service.get_dime_id_with_search(user)).to eq(-1)
    end
  end

  describe '#save_dime_id' do
    it "updates and returns the user's dime_id" do
      service = described_class.new
      user = create :user, dime_id: 0

      result = service.save_dime_id(99, user)

      expect(result).to eq 99
      expect(user.reload.dime_id).to eq 99
    end
  end

  describe '#get_dime_id' do
    subject(:service) { described_class.new }

    it "returns the user's existing dime_id without searching when it is already set" do
      user = create :user, dime_id: 7

      expect(service.get_dime_id(user.id)).to eq 7
      expect(requests.size).to eq 1 # only the login request
    end

    it 'searches DIME when the dime_id is not yet set' do
      user = create :user, dime_id: 0
      allow(login_response).to receive(:body).and_return({ data: [{ id: 55 }] }.to_json)

      expect(service.get_dime_id(user.id)).to eq 55
    end
  end

  describe '#check_for_sick_days' do
    subject(:service) { described_class.new }

    let(:user) { create :user, dime_id: 0 }

    it 'returns -1 without querying project efforts when no DIME employee is found' do
      allow(login_response).to receive(:body).and_return({ data: [] }.to_json)

      expect(service.check_for_sick_days(user.id, Date.new(2026, 1, 1), Date.new(2026, 1, 31))).to eq(-1)
    end

    context 'when a matching DIME employee is found' do
      let(:responses) do
        [
          login_response,
          instance_double(Net::HTTPResponse, body: { data: [{ id: 55 }] }.to_json),
          instance_double(Net::HTTPResponse, body: [{ id: 1 }, { id: 2 }].to_json)
        ]
      end

      before do
        allow(http_double).to receive(:request) do |req|
          requests << req
          responses[requests.size - 1]
        end
      end

      it 'returns the number of matching project efforts for the date range', :aggregate_failures do
        result = service.check_for_sick_days(user.id, Date.new(2026, 1, 1), Date.new(2026, 1, 31))

        expect(result).to eq 2
        expect(requests.last.uri.to_s).to include('project_ids=14&service_ids=1&combine_times=false',
                                                  'start=2026-01-01', 'end=2026-01-31')
      end
    end
  end
end
