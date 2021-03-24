# frozen_string_literal: true

require 'net/http'

class AuthenticateInDime
  def self.log_in
    body = { employee: { email: ENV['USERNAME_DIME'], password: ENV['PASSWORD_DIME'] } }.to_json
    uri = URI('https://dime-apir.stiftungswo.ch/v2/employees/sign_in')
    req = Net::HTTP::Post.new(uri, 'Content-Type' => 'application/json')
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_PEER
    req.body = body
    response = http.request(req)
    response['Authorization']
  end
end
