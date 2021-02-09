# frozen_string_literal: true

module Concerns
  module DateRangeFilterable
    extend ActiveSupport::Concern

    included do
      # All instances whose beginning and ending range is completely inside the passed date range
      scope :in_date_range, (lambda do |beginning, ending|
        where(arel_table[:beginning].gteq(beginning))
          .where(arel_table[:ending].lteq(ending))
      end)

      # All instances whose beginning and ending range completely contains the passed date range
      scope :including_date_range, (lambda do |beginning, ending|
        where(arel_table[:beginning].lteq(beginning))
          .where(arel_table[:ending].gteq(ending))
      end)

      # All instances with an ending after the given date and a beginning before the given date
      scope :after_end, (lambda do |ending|
        where(arel_table[:ending].gt(ending))
          .where(arel_table[:beginning].lteq(ending))
      end)

      # All instances with an beginning before the given date and with an ending after the given date
      scope :before_begin, (lambda do |beginning|
        where(arel_table[:ending].gteq(beginning))
          .where(arel_table[:beginning].lt(beginning))

      end)

      # All instances whose beginning and ending range is fully or partially covering the passed date range
      scope :overlapping_date_range, (lambda do |beginning, ending|
        where(arel_table[:beginning].lteq(ending))
          .where(arel_table[:ending].gteq(beginning))
      end)
    end
  end
end
