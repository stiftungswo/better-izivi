# frozen_string_literal: true

require 'net/http'

class FormbricksClient
  LINK_SURVEY_TYPE = 'link'

  def initialize
    @api_host = ENV.fetch('FORMBRICKS_API_HOST')
    @api_key = ENV.fetch('FORMBRICKS_API_KEY')
    raise FormbricksApiError, 'FORMBRICKS_API_HOST must use https' unless URI(@api_host).scheme == 'https'
  end

  def link_surveys
    surveys.select { |survey| survey['type'] == LINK_SURVEY_TYPE }
  end

  private

  def surveys
    response = fetch_surveys
    raise FormbricksApiError, "Formbricks API request failed with status #{response.code}" unless
        response.is_a?(Net::HTTPSuccess)

    parse_surveys(response.body)
  end

  def parse_surveys(body)
    parsed = JSON.parse(body)
    raise_invalid_shape unless parsed.is_a?(Hash)
    return [] unless parsed.key?('data')

    data = parsed['data']
    raise_invalid_shape unless data.is_a?(Array) && data.all? { |survey| valid_survey?(survey) }

    data
  rescue JSON::ParserError => e
    raise FormbricksApiError, "Formbricks API returned invalid JSON: #{e.message}"
  end

  def valid_survey?(survey)
    survey.is_a?(Hash) &&
      survey['id'].is_a?(String) && !survey['id'].empty? &&
      survey['name'].is_a?(String) && !survey['name'].empty?
  end

  def raise_invalid_shape
    raise FormbricksApiError, 'Formbricks API returned an unexpected response shape'
  end

  def fetch_surveys
    uri = URI("#{@api_host}/api/v1/management/surveys")
    req = Net::HTTP::Get.new(uri, 'x-api-key' => @api_key)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_PEER
    http.request(req)
  rescue StandardError => e
    raise FormbricksApiError, "Formbricks API request failed: #{e.message}"
  end
end
