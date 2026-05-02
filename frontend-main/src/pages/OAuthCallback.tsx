import { useEffect } from "react";

// Google OAuth2 implicit-flow callback page.
// Google redirects here with #access_token=... in the URL hash.
// This page forwards the token to the opener window and closes itself.
export default function OAuthCallback() {
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const token = hash.get("access_token");
    if (token && window.opener) {
      window.opener.postMessage(
        { type: "GOOGLE_OAUTH_TOKEN", token },
        window.location.origin
      );
      window.close();
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontFamily: "sans-serif",
        color: "#666",
        fontSize: 15,
      }}
    >
      Connecting your account…
    </div>
  );
}
