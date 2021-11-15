require 'rails_helper'

RSpec.describe V1::PaymentsController, type: :routing do
  describe 'routing' do
    it 'routes to #show' do
      expect(get: '/v1/payments_list.pdf').to route_to('/v1/payments_list#show', format: 'pdf')
    end

    it 'returns 422 if the token parameter is missing' do
    end

    it 'returns 401 if the token is incorrects' do
    end
  end
end
