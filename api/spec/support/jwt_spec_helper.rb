# frozen_string_literal: true

def generate_jwt_token_for_user(user)
  token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil)
  allowlist_token(token, user)
  token.first
end

def allowlist_token(token, user)
  AllowlistedJwt.create(
    token.second
      .slice('jti', 'aud')
      .merge(exp: Time.zone.at(token.second['exp']), user:)
  )
end
