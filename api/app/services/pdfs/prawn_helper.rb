# frozen_string_literal: true

module Pdfs
  module PrawnHelper
    def cursor_save
      cursor.tap do |old_cursor|
        yield
        move_cursor_to old_cursor
      end
    end
  end
end
