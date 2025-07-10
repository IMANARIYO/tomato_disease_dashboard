export class StorageKeys {
  // 🔐 Authentication
  static readonly ACCESS_TOKEN = "access_token";
  static readonly REFRESH_TOKEN = "refresh_token";
  static readonly IS_AUTHENTICATED = "is_authenticated";

  // 👤 User Info
  static readonly USER_ID = "user_id";
  static readonly USERNAME = "username";
  static readonly USER_EMAIL = "user_email";
  static readonly USER_ROLE = "user_role";
  static readonly USER_PICTURE = "user_picture";

  // ⚙️ App Settings
  static readonly THEME = "app_theme";
  static readonly LANGUAGE = "app_language";
  static readonly ONBOARDING_COMPLETED = "onboarding_completed";

  // 📦 Other
  static readonly CART_ITEMS = "cart_items";
  static readonly SUBSCRIPTION_TYPE = "subscription_type";
  static readonly LAST_VISITED_PAGE = "last_visited_page";

  // 🍪 Cookie Keys
  static readonly COOKIE_CONSENT = "cookie_consent";
  static readonly COOKIE_SESSION_ID = "cookie_session_id";
}
