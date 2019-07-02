# frozen_string_literal: true

module Concerns
  module DateRangeFilterable
    extend ActiveSupport::Concern

    included do
      scope :in_date_range, (lambda do |beginning, ending|
        where(arel_table[:beginning].gteq(beginning))
          .where(arel_table[:ending].lteq(ending))
      end)
    end
  end
end
