# frozen_string_literal: true

class SubscribeToNewsletter
  def initialize(params)
    @body = { email: params['user']['email'],
              first_name: params['user']['first_name'],
              last_name: params['user']['last_name'] }.to_json
    make_post
  end

  def make_post
    uri = URI('https://www.stiftungswo.ch/wp-json/newsletter/v2/subscribers')
    req = Net::HTTP::Post.new(uri, 'Content-Type' => 'application/json')
    req.basic_auth ENV['NEWSLETTER_API_CLIENT_KEY'], ENV['NEWSLETTER_API_CLIENT_SECRET']
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_PEER
    req.body = @body
    http.request(req).
  end
end
