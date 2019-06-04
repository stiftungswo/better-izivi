# frozen_string_literal: true

require 'rails_helper'

RSpec.describe V1::PaymentsController, type: :request do
  describe '#index' do
    let(:request) { get v1_pain_export_path }

    before { create :expense_sheet, :ready_for_payment }

    it_behaves_like 'renders a successful http status code'
  end
end
