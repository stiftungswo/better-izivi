# frozen_string_literal: true

module Pdfs
  module ExpenseSheet
    module HeaderInfoBlockGenerator
      def header_info_block
        move_down 25
        draw_header_rows
      end

      def draw_info_block_line(label, content)
        indent(20) do
          move_down 10
          text label, inline_format: true
          box Colors::GREY, [115, cursor + 15], width: 350, height: 15
          indent(120) do
            move_up 12
            text content.to_s, inline_format: true
          end
        end
      end

      def draw_header_rows
        Fields::InfoBlock::HEADER_ROWS.each do |row|
          label = row[:label]
          content = row[:content]

          label = evaluate_value(label)
          content = evaluate_value(content)

          draw_info_block_line(label, content)
        end
      end
    end
  end
end
