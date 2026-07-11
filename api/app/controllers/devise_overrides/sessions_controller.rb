# frozen_string_literal: true

module DeviseOverrides
  class SessionsController < Devise::SessionsController
    # Devise's own `verify_signed_out_user` (a prepend_before_action on this
    # controller) checks `warden.user(scope:, run_callbacks: false)`, which
    # only reads whatever is already cached on the Warden proxy for this
    # request — it never runs authentication strategies itself. Every other
    # controller in this app populates that cache by calling
    # `authenticate_user!`/`current_user` first; the stock sessions
    # controller never does, so `DELETE /sign_out` always looked
    # "already signed out" and 401'd instead of revoking the token.
    # Re-prepending here runs before the inherited prepend (prepends stack
    # newest-first), so the JWT is decoded and cached before that check runs.
    prepend_before_action :current_user, only: :destroy
  end
end
