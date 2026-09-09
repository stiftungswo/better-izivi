# frozen_string_literal: true

module V1
  class SitesController < ApiController
    include V1::Concerns::AdminAuthorizable

    before_action :authorize_admin!
    before_action :set_site, only: %i[show update]

    def index
      @sites = Site.all
    end

    def show; end

    def create
      @site = Site.new(site_params)

      raise ValidationError, @site.errors unless @site.save

      render :show, status: :created
    end

    def update
      raise ValidationError, @site.errors unless @site.update(site_params)

      render :show
    end

    private

    def set_site
      @site = Site.find(params.expect(:id))
    end

    def site_params
      params.expect(site: %i[name language terms_pdf])
    end
  end
end
