# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ExpenseSheetCalculators::RemainingDaysCalculator, type: :service do
  let(:calculator) { ExpenseSheetCalculators::RemainingDaysCalculator.new(expense_sheet) }

end
