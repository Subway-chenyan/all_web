"""
Custom exceptions for social authentication
"""

class SocialAuthError(Exception):
    """Base exception for social authentication errors"""
    def __init__(self, message, error_code=None, provider=None):
        self.message = message
        self.error_code = error_code
        self.provider = provider
        super().__init__(self.message)


class SocialAuthConfigError(SocialAuthError):
    """Raised when social auth configuration is invalid"""
    pass


class SocialAuthTokenError(SocialAuthError):
    """Raised when token exchange fails"""
    pass


class SocialAuthUserInfoError(SocialAuthError):
    """Raised when user info retrieval fails"""
    pass


class SocialAuthStateError(SocialAuthError):
    """Raised when state validation fails"""
    pass


class SocialAuthRateLimitError(SocialAuthError):
    """Raised when rate limit is exceeded"""
    pass


class SocialAccountExistsError(SocialAuthError):
    """Raised when trying to create a social account that already exists"""
    pass


class SocialAccountNotFoundError(SocialAuthError):
    """Raised when social account is not found"""
    pass


class SocialAccountLinkError(SocialAuthError):
    """Raised when social account linking fails"""
    pass


class SocialProfileSyncError(SocialAuthError):
    """Raised when profile synchronization fails"""
    pass