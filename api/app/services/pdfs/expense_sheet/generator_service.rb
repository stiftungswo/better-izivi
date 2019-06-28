# frozen_string_literal: true

module Pdfs
  module ExpenseSheet
    class GeneratorService
      include Pdfs::ExpenseSheet::ExpenseTableGeneratorHelper
      include Prawn::View
      include HeaderGeneratorHelper
      include InfoBlockGeneratorHelper
      include ExpenseTableGeneratorHelper

      def initialize(expense_sheet)
        @expense_sheet = expense_sheet

        header
        body
      end

      private

      def document
        @document ||= Prawn::Document.new(page_size: 'A4')
      end

      def body
        font_size 10 do
          info_block
          expense_table
        end
      end

      def box(color, pos, size)
        fill_color color
        fill_rectangle pos, size[:width], size[:height]
        fill_color Colors::WHITE
      end

      def cursor_save
        save_cursor = cursor
        yield
        move_cursor_to save_cursor
      end

      # def cursor_save_text(*text_args)
      #   cursor_save do
      #     text(*text_args)
      #   end
      # end

      def cursor_save_text_box(*text_box_args)
        cursor_save do
          text_box(*text_box_args)
        end
      end
    end
  end
end
