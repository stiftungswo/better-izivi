# frozen_string_literal: true

module Pdfs
  module ExpenseSheet
    module HeaderInfoBlockGenerator
      def header_info_block
        move_down 25
        draw_specification_fields
        draw_user_fields
        draw_calculated_fields
      end

      def draw_info_block_line(label, content)
        indent(20) do
          move_down 10
          text label
          box Colors::GREY, [115, cursor + 15], width: 350, height: 15
          indent(120) do
            move_up 12
            text content.to_s, inline_format: true
          end
        end
      end

      def draw_specification_fields
        Fields::InfoBlock::HEADER_ROWS[:service_specification].each do |field, label|
          draw_info_block_line(label, @expense_sheet.service.service_specification.public_send(field))
        end
      end

      def draw_user_fields
        Fields::InfoBlock::HEADER_ROWS[:user].each do |field, label|
          draw_info_block_line(label, @expense_sheet.user.public_send(field))
        end
      end

      def draw_calculated_fields
        Fields::InfoBlock::HEADER_ROWS[:calculated].each do |field|
          draw_info_block_line(field[:label], field[:value].call(@expense_sheet))
        end
      end
    end
  end
end
