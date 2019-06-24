# frozen_string_literal: true

class PhoneListPdfService
  include Prawn::View

  def initialize(expense_sheet)
    @expense_sheet = expense_sheet
    # text I18n.t('pdfs.expense_sheet.header')

    fill_color 'd2f0e6'
    fill_rectangle [0, cursor], bounds.width, 50
    fill_color '000000'

    move_cursor_to cursor - 20

    text I18n.t('pdfs.expense_sheet.header'), align: :center, style: :bold
  end
end
