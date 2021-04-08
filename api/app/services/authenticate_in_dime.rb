# frozen_string_literal: true

require 'net/http'

class AuthenticateInDime
  def initialize(params)
    @body = params
    @res = '' # make reek happy
    log_in
    make_user_dime
  end

  # :reek:FeatureEnvy
  def log_in
    username = ENV.fetch('USERNAME_DIME')
    password = ENV.fetch('PASSWORD_DIME')
    body = { employee: { email: username, password: password } }.to_json
    uri = URI('https://dime-apir.stiftungswo.ch/v2/employees/sign_in')
    req = Net::HTTP::Post.new(uri, 'Content-Type' => 'application/json')
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_PEER
    req.body = body
    @res = http.request(req)['Authorization']
  end

  # :reek:FeatureEnvy
  def make_user_dime
    token = @res
    body = @body
    uri = URI('https://dime-apir.stiftungswo.ch/v2/employees')
    req = Net::HTTP::Post.new(uri, 'Authorization' => token, 'Content-Type' => 'application/json')
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_PEER
    req.body = body
    http.request(req)
  end
end
