# frozen_string_literal: true

module Pdfs
  module PrawnHelper
    def cursor_save
      cursor.tap do |old_cursor|
        yield
        move_cursor_to old_cursor
      end
    end

    def update_font_families
      font_families.update(
        'RobotoCondensed' => {
          normal: Rails.root.join('app', 'assets', 'fonts', 'RobotoCondensed-Regular.ttf'),
          bold: Rails.root.join('app', 'assets', 'fonts', 'RobotoCondensed-Bold.ttf'),
          italic: Rails.root.join('app', 'assets', 'fonts', 'RobotoCondensed-RegularItalic.ttf')
        }
      )
      font 'RobotoCondensed'
    end
  end
end
