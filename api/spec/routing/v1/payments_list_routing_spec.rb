# frozen_string_literal: true

require 'rails_helper'

RSpec.describe V1::PaymentsListController, type: :routing do
  describe 'routing' do
    it 'routes to #show' do
      expect(get: '/v1/payments_list.pdf').to route_to('v1/payments_list#show', format: 'pdf')
    end

    it 'returns 400 if the token parameter is missing' do
      expect(get: '/v1/payments_list.pdf?locale=de').to have_status(200)
    end

    it 'returns 401 if the token is incorrect' do
      expect(get: '/v1/payments_list.pdf?locale=de&token=meow').to have_status(401)
    end
  end
end
