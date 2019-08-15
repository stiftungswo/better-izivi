# frozen_string_literal: true

require 'rails_helper'

RSpec.describe RegionalCenter, type: :model do
  describe 'validations' do
    subject(:model) { described_class.new }

    it { is_expected.to validate_length_of(:short_name).is_equal_to(2) }

    it 'validates that required fields are present', :aggregate_failures do
      %i[name address short_name].each do |field|
        expect(model).to validate_presence_of field
      end
    end
  end
end
