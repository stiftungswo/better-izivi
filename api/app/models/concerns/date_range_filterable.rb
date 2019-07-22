# frozen_string_literal: true

module Concerns
  # TODO: FIX THIS, NAMING AND FUNCIONALITY
  module DateRangeFilterable
    extend ActiveSupport::Concern

    included do
      scope :in_date_range, (lambda do |beginning, ending|
        where(arel_table[:beginning].gteq(beginning))
          .where(arel_table[:ending].lteq(ending))
      end)

      scope :including_date_range, (lambda do |beginning, ending|
        where(arel_table[:beginning].lteq(beginning))
          .where(arel_table[:ending].gteq(ending))
      end)
    end
  end
end
