# frozen_string_literal: true

class ValidationError < StandardError
  attr_reader :validation_errors, :human_readable_descriptions

  def initialize(validation_errors, human_readable_descriptions = nil)
    @validation_errors = validation_errors
    @human_readable_descriptions = human_readable_descriptions || validation_errors.full_messages
  end
end
