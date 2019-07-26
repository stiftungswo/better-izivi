# frozen_string_literal: true

module Pdfs
  module ExpenseSheet
    module GeneratorServiceHelpers
      def self.safe_call_value(value)
        value = value.call(@expense_sheet) if value.is_a? Proc
        value
      end
    end
  end
end
