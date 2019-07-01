# frozen_string_literal: true

module Pdfs
  module ExpenseSheet
    module TableGenerator
      include TableHeader
      include TableSupplement

      def expense_table
        indent(10) do
          move_cursor_to cursor - 50
          draw_expense_table_headers
          move_cursor_to cursor - 35
          draw_expense_table_row
          draw_supplement_rows
        end
      end

      private

      def calculator
        @calculator ||= ExpenseSheetCalculatorService.new(@expense_sheet)
      end

      def draw_expense_table_row
        Fields::ExpenseTable::DAY_ROWS.each do |row|
          count = row[:count].call(@expense_sheet)
          title = I18n.t(row[:header_title_key], count: count)

          draw_row_head([count.to_s, title])
          draw_row_content(row[:calculation_method], count)
          move_cursor_to cursor - 20
        end
      end

      def draw_row_head(headers)
        headers.each.with_index.reduce(bounds.left) do |global_indent, (content, index)|
          current_indent = Fields::ExpenseTable::COLUMN_WIDTHS[0]
          draw_row_head_text(global_indent, content, index)
          global_indent + current_indent
        end
      end

      def draw_row_head_text(global_indent, content, index)
        current_indent = Fields::ExpenseTable::COLUMN_WIDTHS[index]
        current_width = current_indent - (index.even? ? 2 : 0)
        current_align = index.even? ? :right : :left

        cursor_save_text_box(
          content, style: :bold, align: current_align,
                   at: [global_indent, cursor], width: current_width,
                   overflow: :shrink_to_fit, height: 15
        )
        global_indent + current_indent
      end

      def draw_row_content(calculation_method, count)
        header_indent = bounds.left + Fields::ExpenseTable::COLUMN_WIDTHS[0..1].sum + 5

        calculated_expenses = calculator.public_send(calculation_method, count)
        Fields::ExpenseTable::COLUMNS.each.with_index.reduce(header_indent) do |global_indent, (expense, index)|
          draw_row_content_box_and_text(global_indent,
                                        index,
                                        calculated_expenses[expense])
        end
      end

      def draw_row_content_box_and_text(global_indent, index, expense)
        current_indent = Fields::ExpenseTable::COLUMN_WIDTHS[index + 2]
        current_width = current_indent - 5
        last = Fields::ExpenseTable::COLUMNS.size == (index + 1)

        box Colors::GREY, [global_indent, (cursor + 3)], width: current_width, height: 15
        cursor_save_text_box(row_content_format(expense),
                             at: [(global_indent + 3), cursor],
                             width: (current_width - 8),
                             align: (last ? :right : :left))

        global_indent + current_indent
      end

      def row_content_format(expense)
        format('%.2f', expense.to_d / 100)
      end
    end
  end
end
