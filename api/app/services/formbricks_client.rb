# frozen_string_literal: true

require 'net/http'

class FormbricksClient
  LINK_SURVEY_TYPE = 'link'

  def initialize
    @api_host = ENV.fetch('FORMBRICKS_API_HOST')
    @api_key = ENV.fetch('FORMBRICKS_API_KEY')
  end

  def link_surveys
    surveys.select { |survey| survey['type'] == LINK_SURVEY_TYPE }
  end

  private

  def surveys
    response = fetch_surveys
    raise FormbricksApiError, "Formbricks API request failed with status #{response.code}" unless
        response.is_a?(Net::HTTPSuccess)

    JSON.parse(response.body).fetch('data', [])
  end

  def fetch_surveys
    uri = URI("#{@api_host}/api/v1/management/surveys")
    req = Net::HTTP::Get.new(uri, 'x-api-key' => @api_key)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = uri.scheme == 'https'
    http.verify_mode = OpenSSL::SSL::VERIFY_PEER
    http.request(req)
  end
end
