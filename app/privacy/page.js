export default function Page() {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        color: "#333",
        lineHeight: "1.6",
        padding: "10px",
        backgroundColor: "#f9f9f9",
        borderRadius: "5px",
        boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h1 style={{ textAlign: "center", color: "#444" }}>
        Privacy Policy for Smart Monitor
      </h1>

      <h2>Last Updated: 11/12/23</h2>

      <h3>Introduction</h3>
      <p>
        Smart Monitor ({'"we"'} , {'"us"'}, or {'"our"'}) provides a YouTube
        monitoring service designed to give parents insights into their
        children&lsquo;s viewing habits on YouTube. This privacy policy outlines
        our practices regarding the collection, use, and disclosure of
        information through our application in compliance with Google APIs and
        data protection laws.
      </p>

      <h3>Information Collection</h3>
      <p>
        We collect information from users of Smart Monitor through the following
        Google API scopes:
      </p>
      <ul>
        <li>OpenID: For user authentication.</li>
        <li>userinfo.email: To access the user&lsquo;s email address.</li>
        <li>
          userinfo.profile: To access the user&lsquo;s profile information,
          including name, profile picture, and other public information.
        </li>
        <li>
          youtube.force-ssl: To ensure secure communication with YouTube
          services.
        </li>
        <li>
          youtube.readonly: For read-only access to the user&lsquo;s YouTube
          account, which includes viewing data about YouTube videos and
          channels.
        </li>
      </ul>

      <h3>Use of Information</h3>
      <p>The information collected is used to:</p>
      <ul>
        <li>Provide and improve our monitoring services.</li>
        <li>
          Communicate with users regarding their accounts and updates to our
          service.
        </li>
        <li>Enhance user experience by personalizing content.</li>
      </ul>

      <h3>Information Sharing and Disclosure</h3>
      <p>
        We do not sell or rent personal information to third parties.
        Information may be shared with third parties in the following scenarios:
      </p>
      <ul>
        <li>To comply with legal obligations.</li>
        <li>To protect the rights and safety of our users and the public.</li>
        <li>
          With service providers under contract who help with parts of our
          business operations such as cloud hosting providers.
        </li>
      </ul>

      <h3>Data Security</h3>
      <p>
        We are committed to protecting the security of your information and take
        reasonable precautions to protect it. However, Internet data
        transmissions, whether wired or wireless, cannot be guaranteed to be
        100% secure.
      </p>

      <h3>User Rights</h3>
      <p>Users have the right to:</p>
      <ul>
        <li>Access the information we hold about them.</li>
        <li>Request the correction of incorrect information.</li>
        <li>Request the deletion of their information.</li>
        <li>
          Withdraw consent for data processing which may affect service
          availability.
        </li>
      </ul>

      <h3>Cookies and Tracking Technologies</h3>
      <p>We do not use cookies and tracking technologies in our app.</p>

      <h3>International Data Transfers</h3>
      <p>
        Personal information may be stored and processed in any country where we
        have operations or where we engage service providers. We take measures
        to ensure that the data we collect under this privacy policy is
        processed according to the provisions of this policy and the
        requirements of applicable law wherever the data is located.
      </p>

      <h3>Policy Changes</h3>
      <p>
        We may update this privacy policy to reflect changes to our information
        practices. If we make any material changes, we will notify users by
        email or through a notice on the Smart Monitor app.
      </p>

      <h3>Contact Information</h3>
      <p>
        For any questions about this privacy policy or our privacy practices,
        please contact us at help.safemonitor@gmail.com.
      </p>
    </div>
  );
}
