# frozen_string_literal: true

RSpec.shared_examples_for 'login protected resource' do
  subject { response }

  before { request }

  it { is_expected.to have_http_status(:unauthorized) }

  it 'renders an error' do
    expect(parse_response_json(response)).to include(
      error: I18n.t('devise.failure.unauthenticated')
    )
  end
end

RSpec.shared_examples_for 'admin protected resource' do
  subject { response }

  before { request }

  it { is_expected.to have_http_status(:unauthorized) }

  it 'renders an error' do
    expect(parse_response_json(response)).to include(
      error: I18n.t('errors.authorization_error')
    )
  end
end

# RSpec.shared_examples_for 'token protected resource' do
#   subject { response }
#
#   before { request }
#
#   let(:user) { create :user }
#   let(:token) { generate_jwt_token_for_user(user) }
#
#   context 'when no token is provided' do
#     subject { -> { request } }
#
#     let(:token) { nil }
#
#     it { is_expected.to raise_exception ActionController::ParameterMissing }
#   end
#
#   context 'when an invalid token is provided' do
#     let(:token) { 'invalid' }
#
#     it_behaves_like 'admin protected resource'
#   end
# end
