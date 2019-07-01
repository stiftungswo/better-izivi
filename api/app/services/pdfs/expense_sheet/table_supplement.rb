# frozen_string_literal: true

module Pdfs
  module ExpenseSheet
    module TableSupplement
      def draw_supplement_rows
        Fields::ExpenseTable::SUPPLEMENT_ROWS.each do |row|
          draw_supplement_row row
          move_cursor_to cursor - 20
        end
      end

      def draw_supplement_row(row)
        no_content = true
        row.each.reduce(bounds.left) do |global_indent, (indent, content)|
          content = content.call(@expense_sheet).to_s if content.is_a? Proc
          no_content &&= content.empty?

          draw_supplement_row_content(global_indent, indent, content)

          global_indent + indent
        end
        move_cursor_to cursor + 20 if no_content
      end

      def draw_supplement_row_content(global_indent, indent, content)
        header = (global_indent < (bounds.left + 105))
        current_indent = global_indent + (header ? 0 : 5)
        current_width = indent - (header ? 0 : 5)

        if header
          draw_supplement_header(content, current_indent, current_width)
        elsif content.present?
          draw_supplement_box(content, current_indent, current_width)
        end
      end

      def draw_supplement_header(content, current_indent, current_width)
        first = current_indent == bounds.left

        cursor_save_text_box(content,
                             at: [current_indent, cursor],
                             width: current_width - 3,
                             align: (first ? :right : :left),
                             style: :bold,
                             overflow: :shrink_to_fit,
                             height: 15)
      end

      def draw_supplement_box(content, current_indent, current_width)
        last = (current_indent == Fields::ExpenseTable::COLUMN_WIDTHS[0..-2].sum + 5)

        box Colors::GREY, [current_indent, (cursor + 3)], width: current_width, height: 15
        cursor_save_text_box(content,
                             at: [current_indent + 3, cursor],
                             width: current_width - (last ? 8 : 6),
                             align: (last ? :right : :left),
                             overflow: :shrink_to_fit,
                             height: 15)
      end
    end
  end
end
