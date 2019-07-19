# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ExpenseSheetGenerator, type: :service do
  subject { -> { expense_sheet_generator.create_expense_sheets } }

  let(:service) { create :service, :long, beginning: '2018-01-01', ending: '2018-06-29' }
  let(:expense_sheet_generator) { ExpenseSheetGenerator.new(service) }

  describe '#create_expense_sheets' do
    it { is_expected.to change(ExpenseSheet, :count).by(6)}
  end
end
