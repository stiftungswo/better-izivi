# frozen_string_literal: true

require 'rails_helper'

RSpec.describe V1::PaymentsController, type: :routing do
  describe 'routing' do
    it 'routes to #export' do
      expect(get: '/v1/payments/pain/123').to route_to('v1/payments#export', format: :json, payment_timestamp: '123')
    end
  end
end
