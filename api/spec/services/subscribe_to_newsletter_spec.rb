# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SubscribeToNewsletter do
  let(:http_double) { instance_double(Net::HTTP) }
  let(:response_double) { instance_double(Net::HTTPResponse) }
  # Small helper object so the `before` block below can capture the request
  # built inside `Net::HTTP::Post.new`, without relying on `have_received`'s
  # block semantics (which only inspect the first recorded call).
  let(:request_holder) { Struct.new(:request).new }

  before do
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with('NEWSLETTER_API_CLIENT_KEY', nil).and_return('client-key')
    allow(ENV).to receive(:fetch).with('NEWSLETTER_API_CLIENT_SECRET', nil).and_return('client-secret')
    allow(Net::HTTP).to receive(:new).and_return(http_double)
    allow(http_double).to receive(:use_ssl=)
    allow(http_double).to receive(:verify_mode=)
    allow(http_double).to receive(:request) do |req|
      request_holder.request = req
      response_double
    end
  end

  it 'posts the subscriber to the WordPress newsletter endpoint over SSL' do
    described_class.new('email' => 'zivi@example.com', 'first_name' => 'Zivi', 'last_name' => 'Mustermann')

    expect(Net::HTTP).to have_received(:new).with('www.stiftungswo.ch', 443)
    expect(http_double).to have_received(:use_ssl=).with(true)
    expect(http_double).to have_received(:verify_mode=).with(OpenSSL::SSL::VERIFY_PEER)
  end

  it 'sends the email, first and last name as a JSON body' do
    described_class.new('email' => 'zivi@example.com', 'first_name' => 'Zivi', 'last_name' => 'Mustermann')

    expect(JSON.parse(request_holder.request.body)).to eq(
      'email' => 'zivi@example.com', 'first_name' => 'Zivi', 'last_name' => 'Mustermann'
    )
  end

  it 'authenticates with the configured newsletter API client credentials' do
    described_class.new('email' => 'zivi@example.com', 'first_name' => 'Zivi', 'last_name' => 'Mustermann')

    scheme, credentials = request_holder.request['Authorization'].split
    expect(scheme).to eq 'Basic'
    expect(Base64.decode64(credentials)).to eq 'client-key:client-secret'
  end

  it 'posts to the newsletter subscribers endpoint' do
    described_class.new('email' => 'zivi@example.com', 'first_name' => 'Zivi', 'last_name' => 'Mustermann')

    expect(request_holder.request.path).to eq '/wp-json/newsletter/v2/subscribers'
  end
end
