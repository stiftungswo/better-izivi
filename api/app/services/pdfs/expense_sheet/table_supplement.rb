# frozen_string_literal: true

module Pdfs
  module ExpenseSheet
    module TableSupplement
      def draw_supplement_rows
        Fields::ExpenseTable::SUPPLEMENT_ROWS.each do |row|
          draw_supplement_row row
          move_down 20
        end
      end

      def draw_supplement_row(row)
        no_content = true
        row.each.reduce(bounds.left) do |global_indent, (indent, content)|
          content = evaluate_value(content)
          no_content &&= content.empty?

          draw_supplement_row_content(global_indent, indent, content)

          global_indent + indent
        end
        move_up 20 if no_content
      end

      def draw_supplement_row_content(global_indent, indent, content)
        header = (global_indent < (bounds.left + 105))
        header_padding = (header ? 0 : 5)
        current_indent = global_indent + header_padding
        current_width = indent - header_padding

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

      def draw_supplement_box(content, full_indent, full_width)
        last = (full_indent == Fields::ExpenseTable::COLUMN_WIDTHS[0..-2].sum + 5)
        size = last ? 10 : 8

        box Colors::GREY, [full_indent, (cursor + 3)], width: full_width, height: 15
        font_size size do
          draw_supplement_box_content(content, full_indent, full_width)
        end
      end

      def draw_supplement_box_content(content, full_indent, full_width)
        last = (full_indent == Fields::ExpenseTable::COLUMN_WIDTHS[0..-2].sum + 5)
        align = last ? :right : :left
        current_width = full_width - (last ? 8 : 6)
        style = last ? nil : :italic

        cursor_save_text_box(content,
                             at: [full_indent + 3, cursor],
                             width: current_width,
                             overflow: :shrink_to_fit,
                             height: 15,
                             align: align,
                             style: style)
      end
    end
  end
end
