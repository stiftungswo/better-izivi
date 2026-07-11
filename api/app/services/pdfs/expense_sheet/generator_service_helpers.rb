# frozen_string_literal: true

module Pdfs
  module ExpenseSheet
    module GeneratorServiceHelpers
      def self.safe_call(object, *)
        return object.call(*) if object.is_a? Proc

        object
      end

      def safe_call_value(value)
        GeneratorServiceHelpers.safe_call(value, @expense_sheet)
      end
    end
  end
end
