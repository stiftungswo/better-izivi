# frozen_string_literal: true

# frozen_string_literal: true'

class ExpenseSheetPdfService
  include Prawn::View

  COLORS = OpenStruct.new(
    GREEN: 'd2f0e6',
    WHITE: '000000'
  ).freeze

  def initialize(expense_sheet)
    @expense_sheet = expense_sheet
    # text I18n.t('pdfs.expense_sheet.header')

    header
    body
  end

  def document
    @document ||= Prawn::Document.new(page_size: 'A4')
  end

  private

  def header
    fill_color COLORS.GREEN
    fill_rectangle [0, cursor], bounds.width, 30
    fill_color COLORS.WHITE

    move_cursor_to cursor - 10

    text I18n.t('pdfs.expense_sheet.header'), align: :center, style: :bold
  end

  def info_block
    text I18n.t('models.attr')

  end

  def body; end
end
