# frozen_string_literal: true

# Reports which build is running, so rollout tooling can compare it with git.
class VersionController < ApplicationController
  def show
    render json: {
      sha: ENV.fetch('GIT_SHA', 'unknown'),
      branch: ENV.fetch('GIT_BRANCH', 'unknown'),
      built_at: ENV.fetch('BUILD_TIME', 'unknown')
    }
  end
end
