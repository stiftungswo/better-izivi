# frozen_string_literal: true

require 'net/http'

class AuthenticateInDime
  def initialize
    @api_uri = ENV.fetch('API_URI_DIME')
    @token = log_in
  end

  def post(body, uri)
    req = if @token.nil?
            Net::HTTP::Post.new(uri, 'Content-Type' => 'application/json')
          elsif body == 'get'
            Net::HTTP::Get.new(uri, 'Authorization' => @token)
          else
            Net::HTTP::Post.new(uri, 'Authorization' => @token, 'Content-Type' => 'application/json')
          end
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_PEER
    req.body = body if body != 'get'
    http.request(req)
  end

  def log_in
    body = { employee: { email: ENV.fetch('USERNAME_DIME'), password: ENV.fetch('PASSWORD_DIME') } }.to_json
    uri = URI("#{@api_uri}/v2/employees/sign_in")
    response = post(body, uri)
    response['Authorization']
  end

  def make_user_dime(body)
    uri = URI("#{@api_uri}/v2/employees")
    post(body, uri)
  end

  # :reek:FeatureEnvy
  def get_dime_id_with_search(user)
    uri = URI([@api_uri, '/v2/employees?showArchived=false&filterSearch=',
               user.email,
               '&page=1&pageSize=10&orderByTag=id&orderByDir=desc'].join)
    body = 'get'
    response = JSON.parse(post(body, uri).body)
    data = response['data']
    return -1 if data.nil? # no user was found in dime if true

    data_first = data[0]

    return -1 if data_first.nil?

    data_firs_id = data_first['id']
    return -1 if data_firs_id.nil?

    save_dime_id(data_firs_id, user)
  end

  def save_dime_id(id, user)
    user.dime_id = id
    user.save
    user.dime_id
  end

  # :reek:FeatureEnvy
  def get_dime_id(user_id)
    user = User.find_by(id: user_id)

    return get_dime_id_with_search(user) if user.dime_id.zero?

    user.dime_id
  end

  def check_for_sick_days(user_izivi_id, date_start, date_end)
    dime_id = get_dime_id(user_izivi_id)
    return dime_id if dime_id == -1

    uri = URI([@api_uri, '/v2/project_efforts?start=',
               date_start.to_s,
               '&end=',
               date_end.to_s,
               '&employee_ids=',
               dime_id.to_s,
               '&project_ids=14&service_ids=1&combine_times=false'].join) # project id 14 is declared as sick day
    body = 'get'
    response = JSON.parse(post(body, uri).body)
    response.length
  end
end
