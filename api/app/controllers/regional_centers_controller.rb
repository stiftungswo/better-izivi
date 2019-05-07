# frozen_string_literal: true

class RegionalCentersController < ApplicationController
  def index
    render json: RegionalCenter.select(:name, :address, :short_name, :id)
  end
end
